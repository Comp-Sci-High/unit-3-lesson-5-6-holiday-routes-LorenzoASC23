function qs(key){
  const url = new URL(location.href);
  return url.searchParams.get(key);
}

function renderArticle(){
  const idStr = qs('id');
  const title = document.getElementById('aTitle');
  const short = document.getElementById('aShort');
  const detail = document.getElementById('aDetail');
  const backToFact = document.getElementById('backToFact');

  const id = parseInt(idStr, 10);
  const list = window.FACTS || [];
  const item = list.find(f=>f.id === id);
  if(!item){
    title.textContent = 'Article not found';
    short.textContent = '';
    detail.textContent = 'Sorry — the article you requested does not exist.';
    backToFact.href = 'christmas.html';
    return;
  }

  title.textContent = item.title;
  short.textContent = item.short;
  // Make a longer article by expanding the detail a bit
  detail.innerHTML = `<p>${item.detail}</p><p>For more reading, explore local traditions or history books about winter festivals. This short article summarizes the main points and highlights how traditions evolved.</p>`;
  backToFact.href = `fact.html?id=${id}`;

  // Print button
  const printBtn = document.getElementById('printBtn');
  if(printBtn){
    printBtn.addEventListener('click', ()=> window.print());
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', renderArticle);
} else renderArticle();
