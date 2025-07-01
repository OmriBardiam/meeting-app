// Utility functions for Drunksters

export function getTeamByPlayer(player, teams) {
  for (const [teamName, team] of Object.entries(teams)) {
    if (team.members.includes(player)) {
      return { ...team, name: teamName };
    }
  }
  return null;
}

// Add more helpers as needed 