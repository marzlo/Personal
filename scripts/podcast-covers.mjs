// 人工挑選的 Unsplash 日常閱讀照片；同步不再從未分類的圖庫隨機抽圖。
export const podcastCoverPhotos = [
  {
    "id": "5v1P8AM1LJc",
    "image": "https://images.unsplash.com/photo-1721775999121-7be73ba0e29f?auto=format&fit=crop&w=900&h=600&q=82",
    "alt": "木桌上的拿鐵、翻開的書與燭光",
    "artist": "Heriberto Murrieta",
    "url": "https://unsplash.com/photos/5v1P8AM1LJc"
  },
  {
    "id": "hL1eMFgcDOg",
    "image": "https://images.unsplash.com/photo-1762591847984-f983638eefbd?auto=format&fit=crop&w=900&h=600&q=82",
    "alt": "咖啡、蛋糕與書本的日常閱讀時光",
    "artist": "Esra Afşar",
    "url": "https://unsplash.com/photos/hL1eMFgcDOg"
  },
  {
    "id": "QOCsJ8ooM4g",
    "image": "https://images.unsplash.com/photo-1776593596691-3549c94393e7?auto=format&fit=crop&w=900&h=600&q=82",
    "alt": "花束、咖啡與書本的慢生活桌景",
    "artist": "Aliona Zahrai",
    "url": "https://unsplash.com/photos/QOCsJ8ooM4g"
  },
  {
    "id": "DaURtI_hxvA",
    "image": "https://images.unsplash.com/photo-1636467204130-edf8ee206dce?auto=format&fit=crop&w=900&h=600&q=82",
    "alt": "桌上的咖啡與書本，安靜的閱讀片刻",
    "artist": "Sixteen Miles Out",
    "url": "https://unsplash.com/photos/DaURtI_hxvA"
  }
];

export async function refreshPodcastCovers(previous = []) {
  // 保留既有同步呼叫介面；只在已挑選的生活照片間輪換。
  const lastIndex = podcastCoverPhotos.findIndex(photo => photo.id === previous[0]?.id);
  const offset = (lastIndex + 1) % podcastCoverPhotos.length;
  return [...podcastCoverPhotos.slice(offset), ...podcastCoverPhotos.slice(0, offset)].map(photo => ({...photo}));
}
