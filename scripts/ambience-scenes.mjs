export const sceneDetails={
 'rain-window':{label:'雨窗街景',effect:'rain'},
 'city-cafe':{label:'咖啡窗景',effect:'rain'},
 'sunlit-trees':{label:'陽光樹蔭',effect:'leaves'},
 'quiet-coast':{label:'清晨海岸',effect:'coast'},
 'night-street':{label:'夜晚街道',effect:'night'},
 'reading-room':{label:'窗邊閱讀',effect:'light'}
};
export const ambienceScenes=Object.keys(sceneDetails);
export function nextAmbienceScene(previous){const current=ambienceScenes.indexOf(previous||ambienceScenes[0]);return ambienceScenes[(Math.max(0,current)+1)%ambienceScenes.length]}
export function currentAmbienceScene(snapshot){return ambienceScenes.includes(snapshot?.ambienceScene)?snapshot.ambienceScene:ambienceScenes[0]}
