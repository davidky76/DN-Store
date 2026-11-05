  // dn.js - FINAL FIXE - ne crashe plus
function getPanier(){ return JSON.parse(localStorage.getItem('dn_panier')||"[]"); }
function getWishlist(){ return JSON.parse(localStorage.getItem('dn_wishlist')||"[]"); }

function updateHeader(){
  let panier = getPanier();
  let wish = getWishlist();
  let totalQty = panier.reduce((s,p)=>s+(p.qte||p.qty||1),0);
  let totalPrice = panier.reduce((s,p)=>{
    let pr = parseFloat(p.prix) || parseFloat(p.nouveau) || 0;
    return s + pr*(p.qte||p.qty||1);
  },0);
  document.querySelectorAll('#panier-count').forEach(e=>e.textContent=totalQty);
  document.querySelectorAll('#panier-total').forEach(e=>e.textContent= totalPrice.toFixed(2) + " $");
  document.querySelectorAll('#wishlist-count').forEach(e=>e.textContent=wish.length);
}

function refreshUI(){
  let panier = getPanier();
  let wish = getWishlist();

  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    let id = btn.dataset.id;
    if(!id) return;
    let found = panier.find(p=>p.id===id);
    btn.textContent = found ? "Ajouté ✔" : "Ajouter au panier";
    if(found){ btn.style.background="#2ecc71"; btn.style.color="white"; }
    else { btn.style.background=""; btn.style.color=""; }
  });

  document.querySelectorAll('.btn-heart').forEach(btn=>{
    let id = btn.dataset.wishId;
    if(!id) return; // si pas d'id, on saute, c'est ce qui faisait tout rouge
    let inWish = wish.find(w=>w.id===id);
    
    btn.classList.toggle('liked', !!inWish);
    
    let outline = btn.querySelector('.heart-outline');
    let filled = btn.querySelector('.heart-filled');
    if(outline && filled){
      outline.style.display = inWish ? 'none' : 'block';
      filled.style.display = inWish ? 'block' : 'none';
    } else {
      // fallback ancien emoji si SVG pas encore mis
      btn.textContent = inWish ? "❤️" : "🤍";
    }
  });
  updateHeader();
}

document.addEventListener('click', (e)=>{
  const heart = e.target.closest('.btn-heart');
  if(heart){
    e.preventDefault(); e.stopPropagation();
    let id = heart.dataset.wishId;
    if(!id) return;
    let wish = getWishlist();
    if(wish.find(w=>w.id===id)) wish = wish.filter(w=>w.id!==id);
    else wish.push({id:id, nom:heart.dataset.nom, prix:parseFloat(heart.dataset.prix), img:heart.dataset.img});
    localStorage.setItem('dn_wishlist', JSON.stringify(wish));
    refreshUI(); return;
  }
  const cartBtn = e.target.closest('.add-to-cart');
  if(cartBtn){
    e.preventDefault();
    let id = cartBtn.dataset.id;
    let panier = getPanier();
    if(!panier.find(p=>p.id===id)){
      panier.push({id:id, nom:cartBtn.dataset.nom, prix:parseFloat(cartBtn.dataset.prix), img:cartBtn.dataset.img, qte:1, qty:1});
      localStorage.setItem('dn_panier', JSON.stringify(panier));
    }
    refreshUI(); return;
  }
});

document.addEventListener('DOMContentLoaded', refreshUI);













// POUR LES BLOQUES QUI SE CACHES QUAND ON SCROLL 

// HEADER QUI SE CACHE COMME LE FOOTER - VERSION FINALE
document.addEventListener('DOMContentLoaded', () => {
  const topHeader = document.querySelector('.top-header');
  if (!topHeader) return; // sécurité
  
  let lastScroll = window.scrollY;
  
  window.addEventListener('scroll', () => {
    let current = window.scrollY;
    
    if (current > 120 && current > lastScroll) {
      // on descend -> on cache
      topHeader.classList.add('header-hidden');
    } else {
      // on remonte -> on montre
      topHeader.classList.remove('header-hidden');
    }
    lastScroll = current;
  }, {passive: true});
});

// ===== BOTTOM NAV PRO - FIX DEFINITIF DN STORE =====
document.addEventListener('DOMContentLoaded', () => {
  const bottomNav = document.getElementById('bottomNav');
  if(!bottomNav) return;

  let bottomLastScroll = window.scrollY;
  
  // 1. Fonction qui compte VRAI nombre d'articles
  function updateBottomNavPanier(){
    let panier = JSON.parse(localStorage.getItem('dn_panier')) || [];
    let totalQte = 0;
    panier.forEach(p => totalQte += parseInt(p.qte || p.qty || p.quantite || 1));
    
    let badge = document.getElementById('nombre-articles');
    if(badge){
      badge.textContent = totalQte;
      badge.style.display = totalQte > 0 ? 'inline-block' : 'none';
    }
    // Met aussi à jour le header en même temps
    let topBadge = document.getElementById('total-panier');
    if(topBadge) topBadge.textContent = totalQte;
  }

  updateBottomNavPanier();
  
  // Met à jour à chaque changement de panier
  window.addEventListener('storage', updateBottomNavPanier);
  setInterval(updateBottomNavPanier, 1000); // au cas où tu ajoutes sans recharger

  // 2. Scroll hide/show
  bottomNav.classList.add('show');
  window.addEventListener('scroll', () => {
    let current = window.scrollY;
    if(current <= 50){
      bottomNav.classList.remove('hide');
      bottomNav.classList.add('show');
    } else if(current > bottomLastScroll){
      // On descend -> on cache
      bottomNav.classList.add('hide');
      bottomNav.classList.remove('show');
    } else {
      // On remonte -> on montre
      bottomNav.classList.remove('hide');
      bottomNav.classList.add('show');
    }
    bottomLastScroll = current;
  }, {passive: true});

  // 3. Badge PRODUITS nouveau
  let nouveaux = parseInt(localStorage.getItem('dn_nouveaux_produits') || 0);
  let prodBadge = document.getElementById('bottom-produits-badge');
  if(prodBadge && nouveaux > 0){
    prodBadge.textContent = nouveaux;
    prodBadge.style.display = 'inline-block';
  }
});

//FIN DES BLOQUES QUI SE CACHES








// COMPTEUR DES ARTICLES PANNIERS ET DES WISHLISTS


// MISE A JOUR COMPTEURS HEADER - PANIER + WISHLIST
function actualiserHeaderDN(){
  // Panier
  let panier = JSON.parse(localStorage.getItem('dn_panier')) || [];
  let totalQte = 0;
  panier.forEach(p =>{
    totalQte += parseInt(p.qte || p.qty || p.quantite || 1);
  });
  
  let panierSpan = document.getElementById('total-panier');
  if(panierSpan) panierSpan.textContent = totalQte;

  // Wishlist
  let wishlist = JSON.parse(localStorage.getItem('dn_wishlist')) || [];
  let wishSpan = document.getElementById('wishlist-count');
  if(wishSpan) wishSpan.textContent = wishlist.length;
  
  // Si tu utilises ❤ avec id="total-wishlist"
  let wishSpan2 = document.getElementById('total-wishlist');
  if(wishSpan2) wishSpan2.textContent = wishlist.length;
}

// Lance au chargement de chaque page
document.addEventListener('DOMContentLoaded', actualiserHeaderDN);


// BOTTOM NAV - Compteur Panier RÉEL
let bottomPanier = document.getElementById('nombre-articles');
if(bottomPanier) bottomPanier.textContent = totalQte;
if(bottomPanier && totalQte > 0) bottomPanier.style.display = 'inline-block';
if(bottomPanier && totalQte === 0) bottomPanier.style.display = 'none';

// BOTTOM NAV - Badge PRODUITS nouveau
// Quand tu ajoutes un nouveau produit, fais : localStorage.setItem('dn_nouveaux', 1)
let nouveaux = parseInt(localStorage.getItem('dn_nouveaux_produits') || 0);
let prodBadge = document.getElementById('bottom-produits-badge');
if(prodBadge){
  if(nouveaux > 0){
    prodBadge.textContent = nouveaux;
    prodBadge.style.display = 'inline-block';
  } else {
    prodBadge.style.display = 'none';
  }
}


// Quand il clique sur PRODUITS, on efface le badge
document.querySelector('a[href="produits.html"]')?.addEventListener('click', ()=>{
  localStorage.setItem('dn_nouveaux_produits', 0);
});


//  FIN DE COMPTEUR DES ARTICLES



// localStorage.setItem('dn_panier', JSON.stringify([{qte:2}])); puis F5
// Ou pour vider : localStorage.removeItem('dn_panier')

