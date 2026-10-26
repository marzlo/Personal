export const ambienceScenes=['rain-window','city-cafe'];
export function nextAmbienceScene(previous){const current=ambienceScenes.indexOf(previous||ambienceScenes[0]);return ambienceScenes[(Math.max(0,current)+1)%ambienceScenes.length]}
export function currentAmbienceScene(snapshot){return ambienceScenes.includes(snapshot?.ambienceScene)?snapshot.ambienceScene:ambienceScenes[0]}
