// ---------- RAFFLE ADMIN DASHBOARD ----------
// Reads ticket sales from Supabase. Access is enforced by row level security
// in the database (only users listed in public.admins can read anything);
// hiding the dashboard here is just for the UI.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TOTAL_TICKETS = 1000000;
const PAGE_SIZE = 50;

const $ = id => document.getElementById(id);
const naira = n => '₦' + Number(n || 0).toLocaleString('en-NG', {maximumFractionDigits: 2});
const num = n => Number(n || 0).toLocaleString('en-NG');
const lagosTime = d => d ? new Date(d).toLocaleString('en-NG', {timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short'}) : '–';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- AUTH ----------
function showView(view){
  $('loginView').hidden = view !== 'login';
  $('dashboardView').hidden = view !== 'dashboard';
  $('adminUser').hidden = view !== 'dashboard';
}

async function handleSession(session){
  if(!session){ showView('login'); return; }
  const {data: isAdmin, error} = await sb.rpc('is_admin');
  if(error || !isAdmin){
    await sb.auth.signOut();
    $('loginError').textContent = 'This account does not have admin access.';
    showView('login');
    return;
  }
  $('adminEmail').textContent = session.user.email;
  showView('dashboard');
  loadDashboard();
}

let currentUserId = null;
sb.auth.onAuthStateChange((event, session) => {
  // Token refreshes fire this too; only react when the signed-in user changes.
  const userId = session?.user?.id ?? null;
  if(userId === currentUserId && event !== 'INITIAL_SESSION') return;
  currentUserId = userId;
  // Supabase advises against awaiting other calls inside this callback.
  setTimeout(() => handleSession(session), 0);
});

// Supabase Auth signs in by email, so a plain username like "admin" maps to
// an internal address, e.g. admin@therealmccoy.admin (see supabase/README.md).
const ADMIN_USERNAME_DOMAIN = 'therealmccoy.admin';
function loginEmailFor(input){
  const value = input.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${ADMIN_USERNAME_DOMAIN}`;
}

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('loginError').textContent = '';
  $('loginBtn').disabled = true;
  const {error} = await sb.auth.signInWithPassword({
    email: loginEmailFor($('loginEmail').value),
    password: $('loginPassword').value,
  });
  $('loginBtn').disabled = false;
  if(error) $('loginError').textContent = error.message;
});

$('signOutBtn').addEventListener('click', () => sb.auth.signOut());

// ---------- SUMMARY ----------
async function loadSummary(){
  const {data, error} = await sb.from('raffle_summary').select('*').single();
  if(error) throw error;
  $('statTickets').textContent = num(data.tickets_sold);
  $('statRevenue').textContent = naira(data.revenue_ngn);
  $('statOrders').textContent = num(data.paid_orders);
  $('statBuyers').textContent = num(data.unique_buyers);
  $('statRemaining').textContent = num(data.tickets_remaining);
  $('statPending').textContent = num(data.pending_orders);
  const pct = (data.tickets_sold / TOTAL_TICKETS) * 100;
  $('statProgress').style.width = Math.min(pct, 100) + '%';
  const testNote = data.test_orders ? ` Includes ${num(data.test_orders)} simulated test order(s) — delete them before going live.` : '';
  $('statProgressText').textContent = `${pct.toFixed(pct < 1 ? 3 : 1)}% of ${num(TOTAL_TICKETS)} tickets sold.${testNote}`;
}

// ---------- DAILY SALES ----------
async function loadDaily(){
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const {data, error} = await sb.from('raffle_daily_sales')
    .select('*').gte('sale_date', since).order('sale_date', {ascending: false});
  if(error) throw error;
  $('dailyBody').innerHTML = data.length ? data.map(d => `
    <tr>
      <td>${esc(new Date(d.sale_date + 'T00:00:00').toLocaleDateString('en-NG', {dateStyle: 'medium'}))}</td>
      <td>${num(d.orders)}</td>
      <td>${num(d.tickets)}</td>
      <td>${naira(d.revenue_ngn)}</td>
    </tr>`).join('')
    : '<tr><td colspan="4">No sales in the last 30 days yet.</td></tr>';
}

// ---------- ORDERS ----------
let ordersOffset = 0;

function ticketSummary(tickets){
  const codes = (tickets || []).map(t => t.ticket_code);
  if(!codes.length) return '–';
  if(codes.length <= 3) return codes.join(', ');
  return `${codes[0]} … ${codes[codes.length - 1]}`;
}

// Returns {query} rather than the query itself: Supabase queries are thenable,
// so returning one from an async function would run it immediately.
async function buildOrdersQuery(){
  let q = sb.from('ticket_orders')
    .select('id, tx_ref, buyer_name, buyer_email, buyer_phone, quantity, amount_ngn, amount_paid_ngn, status, simulated, created_at, paid_at, tickets(ticket_code, serial)')
    .order('created_at', {ascending: false})
    .order('serial', {referencedTable: 'tickets', ascending: true});

  const status = $('statusFilter').value;
  if(status !== 'all') q = q.eq('status', status);

  const search = $('searchInput').value.trim();
  if(/^RMC-\d+$/i.test(search)){
    const {data, error} = await sb.from('tickets').select('order_id').eq('ticket_code', search.toUpperCase());
    if(error) throw error;
    q = q.in('id', data.length ? data.map(t => t.order_id) : ['00000000-0000-0000-0000-000000000000']);
  } else if(search){
    // Strip characters that have meaning in PostgREST filter syntax.
    const term = search.replace(/[,()*%\\]/g, ' ').trim();
    if(term){
      q = q.or(['buyer_name', 'buyer_email', 'buyer_phone', 'tx_ref'].map(f => `${f}.ilike.%${term}%`).join(','));
    }
  }
  return {query: q};
}

async function loadOrders(reset){
  if(reset){ ordersOffset = 0; $('ordersBody').innerHTML = ''; }
  const {query} = await buildOrdersQuery();
  const {data, error} = await query.range(ordersOffset, ordersOffset + PAGE_SIZE - 1);
  if(error) throw error;

  $('ordersBody').insertAdjacentHTML('beforeend', data.map(o => `
    <tr>
      <td>${esc(lagosTime(o.paid_at || o.created_at))}</td>
      <td>${esc(o.buyer_name)}<div class="admin-sub">${esc(o.tx_ref)}</div></td>
      <td>${esc(o.buyer_email)}<div class="admin-sub">${esc(o.buyer_phone)}</div></td>
      <td>${num(o.quantity)}</td>
      <td>${naira(o.amount_paid_ngn ?? o.amount_ngn)}</td>
      <td class="admin-codes">${esc(ticketSummary(o.tickets))}</td>
      <td><span class="admin-status admin-status-${esc(o.status)}">${o.status === 'paid' ? 'Paid' : 'Unpaid'}</span>${o.simulated ? ' <span class="admin-status admin-status-test">Test</span>' : ''}</td>
    </tr>`).join(''));

  ordersOffset += data.length;
  if(ordersOffset === 0){
    $('ordersBody').innerHTML = '<tr><td colspan="7">No orders match.</td></tr>';
  }
  $('ordersNote').textContent = ordersOffset ? `Showing ${num(ordersOffset)} order(s).` : '';
  $('loadMoreBtn').hidden = data.length < PAGE_SIZE;
}

$('filterForm').addEventListener('submit', e => { e.preventDefault(); loadOrders(true).catch(showError); });
$('statusFilter').addEventListener('change', () => loadOrders(true).catch(showError));
$('loadMoreBtn').addEventListener('click', () => loadOrders(false).catch(showError));

// ---------- CSV EXPORT ----------
function csvCell(v){
  let s = String(v ?? '');
  if(/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheets running it as a formula
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

$('exportBtn').addEventListener('click', async () => {
  $('exportBtn').disabled = true;
  try {
    const rows = [];
    for(let from = 0; ; from += 1000){
      const {data, error} = await sb.from('ticket_orders')
        .select('paid_at, tx_ref, flw_transaction_id, simulated, buyer_name, buyer_email, buyer_phone, quantity, amount_paid_ngn, tickets(ticket_code, serial)')
        .eq('status', 'paid')
        .order('paid_at', {ascending: true})
        .order('serial', {referencedTable: 'tickets', ascending: true})
        .range(from, from + 999);
      if(error) throw error;
      rows.push(...data);
      if(data.length < 1000) break;
    }
    const header = ['Paid at (Lagos)', 'Payment ref', 'Flutterwave ID', 'Name', 'Email', 'Phone', 'Tickets', 'Amount paid (NGN)', 'Ticket codes', 'Simulated test'];
    const lines = [header, ...rows.map(o => [
      lagosTime(o.paid_at), o.tx_ref, o.flw_transaction_id, o.buyer_name, o.buyer_email, o.buyer_phone,
      o.quantity, o.amount_paid_ngn, (o.tickets || []).map(t => t.ticket_code).join(' '), o.simulated ? 'yes' : '',
    ])].map(r => r.map(csvCell).join(','));

    const blob = new Blob([lines.join('\n')], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `raffle-paid-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch(err){
    showError(err);
  } finally {
    $('exportBtn').disabled = false;
  }
});

// ---------- LOAD ----------
function showError(err){
  console.error(err);
  $('lastUpdated').textContent = 'Could not load data: ' + (err.message || err);
}

async function loadDashboard(){
  $('lastUpdated').textContent = 'Loading…';
  try {
    await Promise.all([loadSummary(), loadDaily(), loadOrders(true)]);
    $('lastUpdated').textContent = 'Last updated ' + lagosTime(new Date());
  } catch(err){
    showError(err);
  }
}

$('refreshBtn').addEventListener('click', loadDashboard);
