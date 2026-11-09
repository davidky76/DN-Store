// DN-STORE - Produits client dynamiques - lit dn_produits de l'admin
function getProduitsAdmin(){
  try{ return JSON.parse(localStorage.getItem('dn_produits') || '[]'); }
  catch(e){ return []; }
}

// Lien entre les sections de l'admin et tes id dans produits.html 
const MAP_SECTION = {
  "Nos polos": "polos",
  "Nos tricots": "tricots",
  "Nos hauts": "hauts",
  "Nos bas": "bas",
  "Nos costumes": "costumes",
  "Nos chaussures": "chaussures",
  "Accessoires": "accessoires"
};

function prixEnFC(prixUSD){// Chez toi 8$ = 18 400 CDF, donc 1$ = 2300 CDF
  return Math.round(prixUSD * 2300);
}

function creerArticleAdmin(p){
  const id = "admin-" + p.id;
  const prixUSD = Number(p.prix);
  const prixFC = prixEnFC(prixUSD).toLocaleString();
  const tailles = (p.tailles || []).join(' - ') || 'Taille unique';
  const couleurs = (p.couleurs || []).join(', ') || '';
  const dispo = p.stock === 0 ? '<span style="color:#e63946;font-weight:700">RUPTURE</span>' : p.stock <= 5 ? `<span style="color:#f59e0b;font-weight:700">Plus que ${p.stock} en stock</span>` : `<span style="color:#16a34a">En stock</span>`;

  return `
  <article class="product-cart" id="${id}" data-categorie="admin">
    <img src="${p.photo}" alt="${p.nom}" onerror="this.src='imgs/default.jpg'">
    <div class="product-info">
      <h3>${p.nom} <span style="font-size:11px;background:#f1f3f6;padding:3px 8px;border-radius:20px">NOUVEAU</span></h3>
      <p class="desc">${p.description || ''}</p>
      <p style="font-size:12px;color:#666">Tailles : ${tailles} ${couleurs ? '• Couleurs : '+couleurs : ''}</p>
      <p style="font-size:12px">${dispo}</p>
    </div>
    <div class="product-price">
      <span class="nouveau-prix">${prixUSD} $ / ${prixFC} FC</span>
    </div>
    <button class="add-to-cart" data-id="${id}" data-nom="${p.nom}" data-prix="${prixUSD}" data-img="${p.photo}" ${p.stock===0 ? 'disabled style="opacity:0.5"' : ''}>Ajouter au panier</button>
    <a href="produit.html?id=${id}">Voir les détails</a>
    <button type="button" class="btn-heart" data-wish-id="${id}" data-nom="${p.nom}" data-prix="${prixUSD}" data-img="${p.photo}">
      <svg class="heart-outline" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#333" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-4.35-9-8.5A5.5 5.5 0 0 1 12 7a5.5 5.5 0 0 1 9 5.5c-2.5 4.15-9 8.5-9 8.5z"/></svg>
      <svg class="heart-filled" viewBox="0 0 24 24" width="18" height="18" fill="#e63946" style="display:none"><path d="M12 21s-6.5-4.35-9-8.5A5.5 5.5 0 0 1 12 7a5.5 5.5 0 0 1 9 5.5c-2.5 4.15-9 8.5-9 8.5z"/></svg>
    </button>
  </article>`;
}

function injecterProduitsAdmin(){
  const produits = getProduitsAdmin();
  if(produits.length === 0) return; // si pas de produits admin, on garde juste tes articles en dur

  produits.forEach(p => {
    const idSection = MAP_SECTION[p.categorie];
    if(!idSection) return;
    const section = document.getElementById(idSection);
    if(!section) return;
    const grid = section.querySelector('.products-grid');
    if(!grid) return;
    // Evite les doublons si on recharge
    if(document.getElementById("admin-" + p.id)) return;
    grid.insertAdjacentHTML('beforeend', creerArticleAdmin(p));
  });

  // On ré-attache ton panier et tes coeurs pour les nouveaux articles
  if(typeof initPanier === 'function') initPanier();
  if(typeof initCoeurs === 'function') initCoeurs();
}

// Scroll automatique vers la section si on vient de index.html#polos
document.addEventListener('DOMContentLoaded', injecterProduitsAdmin);