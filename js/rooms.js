// ---------- ROOM DATA ----------
const rooms = [
  {num:'01', name:'Room 01', rate:35000, desc:'Cosy ensuite room with a queen bed, wardrobe, and workspace corner.', bg:'#EDEAE2'},
  {num:'02', name:'Room 02', rate:35000, desc:'Bright ensuite room with balcony access and a reading nook.', bg:'#E7E3D9'},
  {num:'03', name:'Room 03', rate:38000, desc:'Larger ensuite room with a sitting area, ideal for extended stays.', bg:'#EDEAE2'},
  {num:'04', name:'Room 04', rate:38000, desc:'Corner ensuite room with the most natural light and city views.', bg:'#E7E3D9'},
];

function roomSVG(bg){
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="${bg}"/><rect x="30" y="40" width="150" height="220" fill="none" stroke="#6E655C" stroke-width="1.2"/><rect x="220" y="60" width="150" height="120" fill="none" stroke="#6E655C" stroke-width="1.2"/><circle cx="105" cy="150" r="30" fill="none" stroke="#AD8A56" stroke-width="1"/><text x="200" y="285" text-anchor="middle" fill="#6E655C" font-family="Inter, sans-serif" font-size="11">Photo coming soon</text></svg>`;
}

function renderRooms(){
  const grid = document.getElementById('roomsGrid');
  grid.innerHTML = rooms.map(r => `
    <div class="unit-card">
      <div class="unit-photo">
        <span class="unit-num">${r.num}</span>
        ${roomSVG(r.bg)}
      </div>
      <div class="unit-body">
        <h3>${r.name}</h3>
        <div class="unit-meta"><span>Ensuite toilet</span><span>Shared kitchen</span></div>
        <p class="desc">${r.desc}</p>
        <div class="unit-foot">
          <div class="price">&#8358;${r.rate.toLocaleString()} <small>/ night</small></div>
          <a class="book-link" href="booking.html?unit=${encodeURIComponent(r.name)}">Book &rarr;</a>
        </div>
      </div>
    </div>
  `).join('');
}
renderRooms();
