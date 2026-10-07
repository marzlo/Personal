(() => {
  window.ShiyeShareExcerpt = function(body, title = '') {
    const candidates = String(body || '').split(/\n+/).filter(line => !/^\s*(?:#{1,6}\s|https?:\/\/|\[|\|)/.test(line)).flatMap(line => line.replace(/^\s*(?:>\s?|[-*]\s|\d+\.\s)/, '').trim().match(/[^。！？!?]+[。！？!?]/g) || []).map(text => text.trim()).filter(text => text.length >= 28 && text.length <= 190 && !/https?:\/\/|深度探討模式|辯論模式|以下是|以下將|本文將|點擊|訂閱|逐字稿/.test(text));
    const words = /理解|選擇|意識|生命|內在|相信|自由|經驗|責任|思考|感受|行動|練習|心靈|自己|實踐|看見|覺察|真實|生活|成長/g;
    return candidates.map((text, index) => ({text,index,score:(text.match(words)||[]).length * 4 + Math.min(text.length,100)/100 + (/[因所而但不]/.test(text)?1:0)})).sort((a,b)=>b.score-a.score||a.index-b.index)[0]?.text || '';
  };
})();
