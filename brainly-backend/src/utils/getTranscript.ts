async function getParams(videoUrl: string) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return null;

  const apiUrl = "https://www.youtube.com/youtubei/v1/next?prettyPrint=false";

  const headers = {
    "accept": "*/*",
    "accept-language": "en-GB,en;q=0.9",
    "content-type": "application/json",
    "x-youtube-client-name": "1",
    "x-youtube-client-version": "2.20250814.09.00",
  };

  const body = {
    context: {
      client: {
        hl: "en-GB",
        gl: "IN",
        clientName: "WEB",
        clientVersion: "2.20250814.09.00",
      },
    },
    videoId,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const endpoint = findEndPoint(data);
    return endpoint?.params || null;
  } catch (err) {
    console.error("getParams error:", err);
    return null;
  }
}

function findEndPoint(data: any) {
  if (!data?.engagementPanels) return null;

  for (const panel of data.engagementPanels) {
    const renderer = panel?.engagementPanelSectionListRenderer;
    const endpoint =
      renderer?.content?.continuationItemRenderer?.continuationEndpoint
        ?.getTranscriptEndpoint;

    if (endpoint) return endpoint;
  }
  return null;
}

export async function getTranscriptFromYouTubeURL(videoUrl: string) {
  try {
    const params = await getParams(videoUrl);
    if (!params) return "Transcript endpoint not available";

    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/get_transcript?prettyPrint=false",
      {
        method: "POST",
        headers: {
          "accept": "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "content-type": "application/json",
          "x-youtube-client-name": "1",
          "x-youtube-client-version": "2.20250814.09.00",
        },
        body: JSON.stringify({
          context: {
            client: {
              hl: "en-GB",
              gl: "IN",
              clientName: "WEB",
              clientVersion: "2.20250814.09.00",
            },
          },
          params,
          externalVideoId: extractVideoId(videoUrl),
        }),
      }
    );

    if (!response.ok) return "Failed to fetch transcript";

    const data = await response.json();
    const transcriptSegments =
      data?.actions?.[0]?.updateEngagementPanelAction?.content?.transcriptRenderer?.content
        ?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer
        ?.initialSegments;

    if (!Array.isArray(transcriptSegments) || transcriptSegments.length === 0) {
      return "Transcript not available for this video";
    }

    const transcript = transcriptSegments
      .map((segment: any) => {
        const runs = segment?.transcriptSegmentRenderer?.snippet?.runs || [];
        return runs.map((run: any) => run.text).join("");
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return transcript || "Transcript is empty";
  } catch (err) {
    console.error("getTranscriptFromYouTubeURL error:", err);
    return "Error occurred while fetching transcript";
  }
}

function extractVideoId(videoUrl: string): string | null {
  try {
    const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
    const urlStr = videoUrl.trim();
    const normalized = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(urlStr)
      ? urlStr
      : "https://" + urlStr;

    const u = new URL(normalized);
    const host = u.hostname.replace(/^www\./, "");
    const parts = u.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") {
      const id = parts[0];
      return YT_ID_RE.test(id) ? id : null;
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "v") {
        const id = parts[1];
        return YT_ID_RE.test(id) ? id : null;
      }
      const v = u.searchParams.get("v");
      if (v && YT_ID_RE.test(v)) return v;

      const nested = u.searchParams.get("u") || u.searchParams.get("q");
      if (nested) {
        try {
          return extractVideoId(decodeURIComponent(nested));
        } catch {
          return null;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
