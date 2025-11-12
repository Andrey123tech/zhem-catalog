const CART_KEY = 'zhem_cart_v2';
function getCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch(e){return []} }
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); }
function addToCart(item){
  const cart = getCart();
  const key = item.sku+'|'+item.size;
  const idx = cart.findIndex(x => (x.sku+'|'+x.size)===key);
  if (idx>=0){ cart[idx].qty = (Number(cart[idx].qty)||0)+(Number(item.qty)||0); }
  else{ cart.push(item); }
  setCart(cart);
}
function cartCount(){ return getCart().reduce((a,b)=>a+(Number(b.qty)||0),0); }
function updateCartBadge(){ const el=document.getElementById('cart-count'); if(!el) return; el.textContent = cartCount(); }
function showToast(text){ const el=document.getElementById('toast'); if(!el) return; el.textContent=text||'Готово'; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1400); }