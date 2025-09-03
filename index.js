import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import fetch from "node-fetch";
import cron from "node-cron";

// ⚠️ Récupération depuis les variables d'environnement (docker-compose.yml)
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// --- Fonction pour récupérer un menu ---
async function getMenu(dateISO) {
  // Convertir la date ISO (2025-09-03) en format français (2025/09/03)
  const dateFr = dateISO.replace(/-/g, '/');
  const url = `https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/menus-cantines/records?limit=100&refine=secteur:"3"&refine=date:"${dateFr}"`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const results = data.results || [];

    const lignes = [];
    for (const result of results) {
      const repas = (result.repas || result.type_repas || "").toString().trim();
      if (repas && repas.toLowerCase().includes("goûter 2")) continue;
      
      // Construire le plat principal
      let plat = "";
      if (result.entree) plat += result.entree;
      if (result.plat) plat += plat ? ` | ${result.plat}` : result.plat;
      if (result.legumes) plat += plat ? ` + ${result.legumes}` : result.legumes;
      
      if (plat.trim()) {
        lignes.push(`👉 ${plat.trim()}`);
      }
      
      // Ajouter le dessert du midi
      if (result.dessert) {
        lignes.push(`🍰 ${result.dessert}`);
      }
      
      // Séparateur entre le repas du midi et le goûter
      if (result.dessert && result.gouter) {
        lignes.push(`\n🍽️ **Goûter :**`);
      }
      
      // Ajouter le goûter (pas le goûter_02)
      if (result.gouter) {
        lignes.push(`🍪 ${result.gouter}`);
      }
    }

    if (!lignes.length) return "❌ Pas de menu trouvé pour cette date";

    const d = new Date(dateISO);
    const titre = `📅 Menu du ${d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
    return `${titre}\n${lignes.join("\n")}`;
  } catch (error) {
    console.error('Erreur API:', error);
    return "❌ Erreur lors de la récupération du menu";
  }
}

// --- Fonction pour récupérer les menus de la semaine ---
async function getWeekMenus() {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  let text = "📆 **Menus de la semaine**\n\n";
  
  for (let i of [0, 1, 3, 4]) { // lundi, mardi, jeudi, vendredi
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const menu = await getMenu(iso);
    text += menu + "\n\n";
  }
  
  return text;
}

// --- Commandes slash ---
const commands = [
  { name: "today", description: "Menu d’aujourd’hui" },
  { name: "demain", description: "Menu de demain" },
  { name: "semaine", description: "Menu de la semaine en cours" },
  { name: "week", description: "Menu de la semaine (alias)" },
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log("✅ Commandes enregistrées");
}

// --- Événements ---
client.on("ready", () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  // Cron : tous les jours à 08h (lun/mar/jeu/ven)
  cron.schedule("0 8 * * 1-5", async () => {
    const today = new Date();
    const iso = today.toISOString().split("T")[0];
    const day = today.getDay(); // 0=dim, 1=lun, 2=mar, ...
    if ([1, 2, 4, 5].includes(day)) {
      const menu = await getMenu(iso);
      client.channels.cache.get(CHANNEL_ID).send(menu);
    }
  });

  // Cron : menu de la semaine le lundi 08h
  cron.schedule("0 8 * * 1", async () => {
    const weekMenus = await getWeekMenus();
    client.channels.cache.get(CHANNEL_ID).send(weekMenus);
  });
});

// --- Réponses aux commandes ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "today") {
    const iso = new Date().toISOString().split("T")[0];
    const menu = await getMenu(iso);
    await interaction.reply(menu);
  }

  if (interaction.commandName === "demain") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const iso = d.toISOString().split("T")[0];
    const menu = await getMenu(iso);
    await interaction.reply(menu);
  }

  if (interaction.commandName === "semaine" || interaction.commandName === "week") {
    const weekMenus = await getWeekMenus();
    await interaction.reply(weekMenus);
  }
});

// --- Lancement ---
registerCommands().then(() => client.login(TOKEN));
