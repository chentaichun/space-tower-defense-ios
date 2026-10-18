export async function rankedProfile(env,key){
  const row=await env.COMMERCE_DB.prepare('SELECT rating, wins, losses, reward_total AS rewardTotal FROM ranked_profiles WHERE player_key = ?').bind(key).first();
  return {rating:row?.rating??1200,streak:{wins:row?.wins??0,losses:row?.losses??0},rewardTotal:row?.rewardTotal??0};
}
export async function settleRanked(env,state){
  const commands=[];
  state.players.forEach((p,i)=>{
    if(p.bot)return;
    const r=state.match.results[i];
    commands.push(env.COMMERCE_DB.prepare('INSERT OR IGNORE INTO ranked_results (match_id, player_key, outcome, rating_after, wins, losses, obsidian, opponent_kind, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(state.id,p.key,r.outcome,r.ratingAfter,r.streak.wins,r.streak.losses,r.obsidian,state.players[1-i].bot?'bot':'human',new Date().toISOString()));
  });
  await env.COMMERCE_DB.batch(commands);
}
export async function rankedRewardTotal(env,key){
  if(!env.COMMERCE_DB)return 0;
  // Old deployments may not have installed the ranked migration yet.
  try{return (await rankedProfile(env,key)).rewardTotal;}catch{return 0;}
}
