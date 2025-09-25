export const random = (len : number) =>{
    const options = "qwertyuiopasdfghjklzxcvbnm0987654321="
    let ans = "";
    for(let i=0; i<len; i++){
        ans += options[Math.floor(Math.random()*options.length)];
    }
    return ans;
}