// api/steam.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const genre = req.query.genre || ''; // action, adventure, rpg...
  
  // Puxando lista de apps da Steam
  const listResp = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
  const listJson = await listResp.json();
  const apps = listJson.applist.apps;

  // Filtrando por gênero (se fornecido)
  // OBS: Steam API básica não dá gênero direto, aqui é só exemplo
  const filtered = apps.filter(a => a.name.toLowerCase().includes(genre.toLowerCase()));

  // Pega um aleatório
  const game = filtered[Math.floor(Math.random() * filtered.length)] || { name: 'Jogo desconhecido', appid: 0 };

  // Pega detalhes do jogo
  const detailsResp = await fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}&l=portuguese`);
  const detailsJson = await detailsResp.json();
  const details = detailsJson[game.appid]?.data || {};

  res.status(200).json({
    title: details.name || game.name,
    desc: details.short_description || 'Sem descrição',
    img: details.header_image || '',
    steam: `https://store.steampowered.com/app/${game.appid}`
  });
}
