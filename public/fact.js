function qs(key){
  const url = new URL(location.href);
  return url.searchParams.get(key);
}

function renderFact(){
  const idStr = qs('id');
  const container = document.getElementById('detail');
  const title = document.getElementById('factTitle');
  const short = document.getElementById('factShort');
  const detail = document.getElementById('factDetail');

  const id = parseInt(idStr, 10);
  const list = window.FACTS || [];
  const item = list.find(f=>f.id === id);
  if(!item){
    title.textContent = 'Fact not found';
    short.textContent = '';
    detail.textContent = 'Sorry — the fact you requested does not exist. Return to the train and try another cart.';
    return;
  }

  title.textContent = item.title;
  short.textContent = item.short;
  detail.textContent = item.detail;
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', renderFact);
} else renderFact();
