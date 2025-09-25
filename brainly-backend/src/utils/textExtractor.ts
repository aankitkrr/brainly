import { getTranscriptFromYouTubeURL } from "./getTranscript";
import { getTweetTextViaScraping } from "./getTweet";

export async function extractYouTubeText(link: string): Promise<string> {
  try {
    const transcript = await getTranscriptFromYouTubeURL(link);
    console.log("Raw transcript:", transcript);
    if(transcript){
      return transcript;
    }else{
      console.warn("Transcript is empty.");
    }
  }catch (err) {
    console.warn("Transcript fetch failed:", err);
  }
  return "null";
}

async function extractTweetText(link: string): Promise<string> {
  try{
    const tweet = await getTweetTextViaScraping(link);
    if (tweet) {
      return tweet;
    }
  }catch(err){
    console.warn("Tweet scrape failed:", err);
  }
  return "Tweet not available"
}

export async function extractText(link: string, type: "youtube" | "tweet"): Promise<string> {
  if (type === "youtube") return extractYouTubeText(link);
  if (type === "tweet") return extractTweetText(link);
  throw new Error("Unsupported type");
}
