 // DN-STORE ADMIN - DASHBOARD FINAL
function getProduits(){ return JSON.parse(localStorage.getItem('dn_produits') || '[]'); }
function getCommandes(){ return JSON.parse(localStorage.getItem('dn_commandes') || '[]'); }
function saveCommandes(liste){ localStorage.setItem('dn_commandes', JSON.stringify(liste)); }

// Données démo une seule fois, pour tester
if(!localStorage.getItem('dn_init')){
  localStorage.setItem('dn_produits', JSON.stringify([
    {id:1, nom:"Nike Air Max", prix:45000, stock:12},
    {id:2, nom:"Adidas Samba", prix:38000, stock:3},
    {id:3, nom:"Puma RS-X", prix:52000, stock:0},
    {id:4, nom:"New Balance 550", prix:48000, stock:8}
  ]));
  localStorage.setItem('dn_commandes', JSON.stringify([
    {id:101, client:"David Kyaswa", produit:"Nike Air Max", total:45000, etat:"Livrée"},
    {id:102, client:"Sarah M.", produit:"Adidas Samba", total:38000, etat:"Reçue"},
    {id:103, client:"Chris B.", produit:"Puma RS-X", total:52000, etat:"En préparation"},
    {id:104, client:"Sarah M.", produit:"New Balance 550", total:48000, etat:"Expédiée"}
  ]));
  localStorage.setItem('dn_init','1');
}

let filtreRecherche = "";

function afficherDashboard(){
  const produits = getProduits();
  const commandes = getCommandes();

  const ca = commandes.filter(c => c.etat==="Livrée" || c.etat==="Expédiée").reduce((s,c)=>s+Number(c.total||0),0);
  document.getElementById('statCA').textContent = ca.toLocaleString('fr-FR')+" FC";
  document.getElementById('statCommandes').textContent = commandes.length;
  document.getElementById('statProduits').textContent = produits.length;
  document.getElementById('statProduitsDetail').textContent = produits.filter(p=>p.stock>0).length+" en stock";
  document.getElementById('statClients').textContent = [...new Set(commandes.map(c=>c.client))].length;

  const rupture = produits.filter(p=>p.stock===0).length;
  const critique = produits.filter(p=>p.stock>0 && p.stock<=5).length;
  const alert = document.getElementById('stockAlert');
  if(rupture>0 || critique>0){
    alert.classList.remove('hidden');
    alert.classList.toggle('danger', rupture>0);
    alert.textContent = `⚠️ Attention : ${rupture} produit(s) en rupture, ${critique} en niveau critique. Pense à réapprovisionner.`;
  } else {
    alert.classList.add('hidden');
  }

  // Commandes récentes + recherche
  const commandesFiltrees = commandes.filter(c => c.client.toLowerCase().includes(filtreRecherche.toLowerCase()) || c.produit.toLowerCase().includes(filtreRecherche.toLowerCase()));
  const zoneCmd = document.getElementById('listeCommandes');
  if(commandesFiltrees.length===0){
    zoneCmd.innerHTML = `<div class="empty">Aucune commande trouvée.</div>`;
  } else {
    zoneCmd.innerHTML = commandesFiltrees.slice(-5).reverse().map(c=>`
      <div class="ligne">
        <div><b>${c.client}</b><br><small>${c.produit} - ${Number(c.total).toLocaleString()} FC</small></div>
        <select onchange="changerEtat(${c.id}, this.value)">
          <option ${c.etat==="Reçue"?"selected":""}>Reçue</option>
          <option ${c.etat==="En préparation"?"selected":""}>En préparation</option>
          <option ${c.etat==="Expédiée"?"selected":""}>Expédiée</option>
          <option ${c.etat==="Livrée"?"selected":""}>Livrée</option>
          <option ${c.etat==="Annulée"?"selected":""}>Annulée</option>
        </select>
      </div>`).join('');
  }

  // Produits à surveiller
  const aSurveiller = produits.filter(p=>p.stock<=5).sort((a,b)=>a.stock-b.stock);
  const zoneProd = document.getElementById('listeProduits');
  if(aSurveiller.length===0){
    zoneProd.innerHTML = `<div class="empty">✅ Tous les produits sont bien en stock.</div>`;
  } else {
    zoneProd.innerHTML = aSurveiller.map(p=>{
      let badge = p.stock===0 ? `<span class="badge badge-rupture">Rupture</span>` : `<span class="badge badge-critique">Critique : ${p.stock} restants</span>`;
      return `<div class="ligne"><div><b>${p.nom}</b><br><small>${Number(p.prix).toLocaleString()} FC</small></div>${badge}</div>`;
    }).join('');
  }

  // Résumé
  document.getElementById('resumeText').textContent = `Tu as ${produits.length} produits, dont ${rupture} en rupture et ${critique} en critique. Tu as ${commandes.length} commandes, pour un chiffre d'affaires de ${ca.toLocaleString()} FC. La prochaine action : réapprovisionner les produits en rupture, puis traiter les commandes en état Reçue.`;
}

function changerEtat(id, nouvelEtat){
  let commandes = getCommandes();
  commandes = commandes.map(c=> c.id===id ? {...c, etat:nouvelEtat} : c);
  saveCommandes(commandes);
  afficherDashboard();
}

document.getElementById('searchCmd')?.addEventListener('input', (e)=>{
  filtreRecherche = e.target.value;
  afficherDashboard();
});

document.getElementById('btnReset')?.addEventListener('click', ()=>{
  if(confirm("Effacer les données démo pour mettre tes vrais produits ?")){
    localStorage.removeItem('dn_produits');
    localStorage.removeItem('dn_commandes');
    localStorage.removeItem('dn_init');
    location.reload();
  }
});

document.getElementById('btnLogout')?.addEventListener('click', ()=>{
  window.location.href = "index.html";
});

afficherDashboard();

// MENU MOBILE - HAMBURGER
const sidebar = document.getElementById('sidebar');
const btnMenu = document.getElementById('btnMenu');
const btnClose = document.getElementById('btnClose');
const overlay = document.getElementById('overlay');

btnMenu?.addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.add('show');
});
function fermerMenu(){
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}
btnClose?.addEventListener('click', fermerMenu);
overlay?.addEventListener('click', fermerMenu);

// Quand on clique sur un lien du menu sur mobile, on ferme le menu
document.querySelectorAll('.sidebar nav a').forEach(lien => {
  lien.addEventListener('click', fermerMenu);
});