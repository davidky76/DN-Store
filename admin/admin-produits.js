 function brancherPhoto(num){
  const inputFile = document.getElementById(num === 1 ? 'photoInput' : 'photoInput' + num);
  const inputUrl = document.getElementById(num === 1 ? 'photoUrl' : 'photoUrl' + num);
  const preview = document.getElementById(num === 1 ? 'previewPhoto' : 'previewPhoto' + num);
  if(!inputFile) return;
  inputFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => { preview.src = ev.target.result; preview.style.display = 'block'; if(inputUrl) inputUrl.value = ev.target.result; };
    reader.readAsDataURL(file);
  });
  if(inputUrl) inputUrl.addEventListener('input', () => { preview.src = inputUrl.value; preview.style.display = inputUrl.value ? 'block' : 'none'; });
}
brancherPhoto(1); brancherPhoto(2); brancherPhoto(3); brancherPhoto(4);

function getPhoto(num){
  const inputUrl = document.getElementById(num === 1 ? 'photoUrl' : 'photoUrl' + num);
  return inputUrl ? inputUrl.value.trim() : '';
}





// DN-STORE - ADMIN PRODUITS - communique avec admin.html taille via dn_produits $
function getProduits(){ return JSON.parse(localStorage.getItem('dn_produits') || '[]'); }
function saveProduits(l){ localStorage.setItem('dn_produits', JSON.stringify(l)); }

let idEnCours = null;
let filtreActuel = "tous";
let recherche = "";
let photoBase64 = "";

const form = document.getElementById('formProduit');
const photoInput = document.getElementById('photoInput');
const preview = document.getElementById('previewPhoto');

photoInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{ photoBase64 = reader.result; preview.src = photoBase64; preview.style.display='block'; };
  reader.readAsDataURL(file);
});






function getCouleursCochees(){
  return [...document.querySelectorAll('input[name="couleur"]:checked')].map(i=>i.value);
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const nom = document.getElementById('nom').value.trim();
  const categorie = document.getElementById('categorie').value;
  const genre = document.getElementById('genre').value;
  if(!categorie){alert("Choisis d'abord la section"); return;}
  const prix = Number(document.getElementById('prix').value);
  const stock = Number(document.getElementById('stock').value);
  const description = document.getElementById('description').value.trim();
  const photoUrl = document.getElementById('photoUrl').value.trim();
  const photo = getPhoto(1);
  const images = [getPhoto(1), getPhoto(2), getPhoto(3), getPhoto(4)].filter(p => p !== '');

  if(!nom || !prix || stock < 0){ alert("Remplis nom, prix et stock"); return; }

  let produits = getProduits();
  if(idEnCours){
    produits = produits.map(p => p.id === idEnCours ? {...p, categorie, genre, nom, prix, stock, description, photo, images, tailles:getTaillesCochees(), couleurs:getCouleursCochees()} : p);
    idEnCours = null;
    document.getElementById('titreForm').textContent = "+ Ajouter un produit";
    document.getElementById('btnAnnuler').style.display = 'none';
  } else {
    produits.push({id: Date.now(), categorie, genre, nom, prix, stock, description, photo, images, tailles:getTaillesCochees(), couleurs:getCouleursCochees()});
  }
  saveProduits(produits);
  form.reset();
  afficherTaillesPourSection(""); //on vide les tailles
  preview.style.display = 'none';
  photoBase64 = "";
  afficherProduits();
  alert("Produit enregistré ! Va voir ton Dashboard, il a déjà changé.");
});






function afficherProduits(){
  const produits = getProduits();
  const rupture = produits.filter(p=>p.stock===0).length;
  const critique = produits.filter(p=>p.stock>0 && p.stock<=5).length;
  document.getElementById('resumeProduits').textContent = `${produits.length} produit(s) - ${rupture} en rupture - ${critique} en critique`;

  let liste = produits.filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase()));
  if(window.sectionFiltre && window.sectionFiltre !== "tous"){
    liste = liste.filter(p => p.categorie === window.sectionFiltre);
  }
  if(filtreActuel==="rupture") liste = liste.filter(p=>p.stock===0);
  if(filtreActuel==="critique") liste = liste.filter(p=>p.stock>0 && p.stock<=5);

  const zone = document.getElementById('listeProduitsPage');
  if(liste.length===0){ zone.innerHTML = `<div class="empty">Aucun produit. Ajoute ton premier produit à gauche.</div>`; return; }

  zone.innerHTML = liste.map(p=>{
    let badge = p.stock===0 ? `<span class="badge badge-rupture">Rupture</span>` : p.stock<=5 ? `<span class="badge badge-critique">Critique : ${p.stock}</span>` : `<span class="badge badge-ok">En stock : ${p.stock}</span>`;
    return `<div class="ligne" style="gap:10px">
      <img src="${p.photo}" style="width:52px;height:52px;object-fit:cover;border-radius:10px" onerror="this.src='https://via.placeholder.com/52'">
      <div style="flex:1"><span style="font-size:11px;background:#f1f3f6;padding:3px 8px;border-radius:20px>${p.categorie || 'Sans section'}</span><br><b>${p.nom}</b><small>${Number(p.prix)} $ / ${(Number(p.prix) * 2300).toLocaleString()} $ - Tailles: ${(p.tailles||[]).join(', ') || ' - '} - Couleurs: ${(p.couleurs||[]).join(', ') || ' - '}</small><br><small>${p.description||''}</small></div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${badge}
        <div><button onclick="modifierProduit(${p.id})" style="padding:6px 10px;border-radius:8px;border:1px solid #ddd;cursor:pointer">Modifier</button>
        <button onclick="supprimerProduit(${p.id})" style="padding:6px 10px;border-radius:8px;border:none;background:#fee2e2;color:#991b1b;cursor:pointer">Supprimer</button></div>
      </div>
    </div>`;
  }).join('');
}







function modifierProduit(id){
  const p = getProduits().find(x=>x.id===id);
  if(!p) return;
  idEnCours = id;
  document.getElementById('nom').value = p.nom;
  document.getElementById('prix').value = p.prix;
  document.getElementById('stock').value = p.stock;
  document.getElementById('description').value = p.description || "";
  document.getElementById('photoUrl').value = p.photo.startsWith('data:') ? "" : p.photo;
  // On affiche d'abord les bonnes tailles pour sa section, puis on coche
  afficherTaillesPourSection(p.categorie, p.tailles || []);
  document.getElementById('categorie').value = p.categorie;
  document.querySelectorAll('input[name="couleur"]').forEach(i=> i.checked = (p.couleurs||[]).includes(i.value));
  document.getElementById('titreForm').textContent = "Modifier : " + p.nom;
  document.getElementById('btnAnnuler').style.display = 'block';
  window.scrollTo({top:0, behavior:'smooth'});
}








function supprimerProduit(id){
  if(!confirm("Supprimer ce produit ? Il disparaîtra aussi côté client.")) return;
  saveProduits(getProduits().filter(p=>p.id!==id));
  afficherProduits();
}
document.getElementById('btnAnnuler').addEventListener('click', ()=>{ idEnCours=null; form.reset(); preview.style.display='none'; document.getElementById('titreForm').textContent="+ Ajouter un produit"; document.getElementById('btnAnnuler').style.display='none'; });
document.getElementById('searchProduit').addEventListener('input', e=>{ recherche=e.target.value; afficherProduits(); });
document.querySelectorAll('.filter-btn').forEach(b=> b.addEventListener('click', ()=>{
  document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  filtreActuel = b.dataset.filtre; afficherProduits();
}));

// Men let u mobile
const sidebar=document.getElementById('sidebar');
document.getElementById('btnMenu')?.addEventListener('click', ()=>{ sidebar.classList.add('open'); document.getElementById('overlay').classList.add('show'); });
function fermerMenu(){ sidebar.classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }
document.getElementById('btnClose')?.addEventListener('click', fermerMenu);
document.getElementById('overlay')?.addEventListener('click', fermerMenu);
document.getElementById('btnLogout')?.addEventListener('click', ()=> window.location.href="../index.html");

document.getElementById('filtreSection').addEventListener('change', e=>{
  filtreActuel = "tous";
  const sectionChoisie = e.target.value;
  // On filtre directement ici
  const produits = getProduits();
  const liste = sectionChoisie === "tous" ? produits : produits.filter(p=>p.categorie === sectionChoisie);
  // On réutilise submit afficherProduits avec un petit hack : on stocke la section
  window.sectionFiltre = sectionChoisie;
  afficherProduits();
});







// TAILLES PAR SECTION - DN-STORE
const TAILLES_PAR_SECTION = {
  "Nos polos": ["XS","S","M","L","XL","XXL","XXXL"],
  "Nos tricots": ["S","M","L","XL","XXL"],
  "Nos hauts": ["S","M","L","XL","XXL"],
  "Nos bas": ["28","30","32","34","36","38","40","42"],
  "Nos costumes": ["S","M","L","XL","XXL","38","40","42","44","46","48"],
  "Nos chaussures": ["38","39","40","41","42","43","44","45"],
  "Accessoires": ["Taille unique"]
};

function afficherTaillesPourSection(section, taillesDejaCochees = []){
  const zone = document.getElementById('tailles');
  if(!section || !TAILLES_PAR_SECTION[section]){
    zone.innerHTML = `<small style="color:#888">Choisis d'abord la section en haut, les tailles vont apparaître ici.</small>`;
    return;
  }
  zone.innerHTML = TAILLES_PAR_SECTION[section].map(t => 
    `<label><input type="checkbox" value="${t}" ${taillesDejaCochees.includes(t) ? 'checked' : ''}> ${t}</label>`
  ).join('');
}

function getTaillesCochees(){
  return [...document.querySelectorAll('#tailles input:checked')].map(i=>i.value);
}

// Quand tu changes de section, les tailles changent toutes seules
document.getElementById('categorie').addEventListener('change', (e)=>{
  afficherTaillesPourSection(e.target.value);
});
  

afficherProduits();