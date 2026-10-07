// ---------- RAFFLE: PRIZE TABLE ----------
const rafflePrizes = [
  {name:'One-year rent-free self-contained apartment (strategic Abuja location)', qty:1, unit:1200000, total:1200000},
  {name:'Big live cows', qty:2, unit:1000000, total:2000000},
  {name:'Cash prizes of &#8358;500,000 for two people', qty:2, unit:500000, total:1000000},
  {name:'Cash prizes of &#8358;250,000 for two people', qty:2, unit:250000, total:500000},
  {name:'50 kg Red Bull Rice', qty:30, unit:55000, total:1650000},
  {name:'25 L Kings Cooking Oil', qty:20, unit:60000, total:1200000},
  {name:'LG Microwaves', qty:6, unit:90000, total:540000},
  {name:'Ox Standing Fans', qty:15, unit:30000, total:450000},
  {name:'Samsung Televisions', qty:3, unit:250000, total:750000},
  {name:'Hisense Fridges', qty:2, unit:200000, total:400000},
  {name:'LG Washing Machines', qty:2, unit:200000, total:400000},
  {name:'Thermocool Deep Freezers', qty:2, unit:250000, total:500000},
  {name:'Binatone Air Fryers', qty:6, unit:70000, total:420000},
  {name:'LG Air Conditioner', qty:1, unit:350000, total:350000},
  {name:'Binatone Humidifiers', qty:6, unit:20000, total:120000},
];
function renderRafflePrizes(){
  const body = document.getElementById('raffleTableBody');
  if(!body) return;
  body.innerHTML = rafflePrizes.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.qty}</td>
      <td>&#8358;${p.unit.toLocaleString()}</td>
      <td>&#8358;${p.total.toLocaleString()}</td>
    </tr>
  `).join('');
}
renderRafflePrizes();

// ---------- RAFFLE: TERMS & CONDITIONS ----------
const raffleTerms = [
  {
    q: '1. Definitions',
    a: `<ul>
      <li><strong>&ldquo;Promoter&rdquo;</strong> means The Real Mc&rsquo;Coy Partners / The Real Mc&rsquo;Coy Ltd.</li>
      <li><strong>&ldquo;Raffle&rdquo;</strong> means The Real Mc&rsquo;Coy Promotional Raffle Draw.</li>
      <li><strong>&ldquo;Ticket&rdquo;</strong> means a unique serialised entry.</li>
      <li><strong>&ldquo;Draw Period&rdquo;</strong> means the one-year period during which tickets are sold and draws are held in randomly selected months.</li>
      <li><strong>&ldquo;Prize Pool&rdquo;</strong> means the &#8358;10,000,000 allocated exclusively to the prizes listed above.</li>
      <li><strong>&ldquo;Regulator&rdquo;</strong> means FCT-LRO.</li>
    </ul>`
  },
  {
    q: '2. Purpose',
    a: `<p>The Raffle is organised to celebrate the tenth anniversary of The Real Mc&rsquo;Coy Ltd, reward participants, support CSR, and promote the Promoter&rsquo;s projects under full regulatory compliance.</p>`
  },
  {
    q: '3. Duration &amp; Draws',
    a: `<ul>
      <li>The Raffle runs for one (1) year.</li>
      <li>Draws are conducted in randomly selected months within the year.</li>
      <li>Exact draw months and dates will be announced publicly and approved by FCT-LRO in advance.</li>
      <li>Changes only with public notice and regulatory approval.</li>
    </ul>`
  },
  {
    q: '4. Eligibility',
    a: `<p>Participants must be 18 years or older.</p>
    <p>Directors, employees, agents, auditors, regulators, and their immediate family members of the Promoter are prohibited from participating.</p>`
  },
  {
    q: '5. Tickets',
    a: `<ul>
      <li>Tickets are valid only when payment is confirmed, serialised, timestamped, and logged in the official encrypted database.</li>
      <li>Tickets cannot be cancelled, refunded, transferred, or altered.</li>
      <li>The Promoter is not responsible for lost, stolen, or damaged tickets.</li>
      <li>Each ticket is allocated to the draws according to the rules announced for the relevant draw months.</li>
    </ul>`
  },
  {
    q: '6. Prizes',
    a: `<p>Prizes are as listed in the Raffle Description (with approximate market values). The full &#8358;10,000,000 is allocated to prizes.</p>
    <p>Regulatory and administrative fees (&#8358;2,400,000) are additional and are not deducted from the prize pool.</p>
    <p>All physical prizes will be procured, documented, verified, and securely stored before ticket sales begin.</p>
    <p>Substitution of any prize requires prior written FCT-LRO approval and must be of equal or higher value.</p>`
  },
  {
    q: '7. Draw Process',
    a: `<ul>
      <li>Draws are livestreamed, recorded, and supervised by an independent auditor, legal counsel, FCT-LRO representative, and internal compliance officer.</li>
      <li>Only FCT-LRO-approved randomisation equipment is used.</li>
      <li>Results are published within 24 hours.</li>
      <li>Every valid ticket eligible for a particular draw has equal probability of winning.</li>
    </ul>`
  },
  {
    q: '8. Winner Verification &amp; Redemption',
    a: `<ul>
      <li>Winners must present valid government-issued ID and complete verification (including AML/CFT screening for high-value prizes).</li>
      <li>Cash prizes are paid by electronic bank transfer only into an account in the winner&rsquo;s name.</li>
      <li>Physical prizes are collected at announced points (proxy collection permitted with written authorisation and IDs).</li>
      <li>Prizes must be claimed within 180 days or are forfeited.</li>
    </ul>`
  },
  {
    q: '9. Fraud, Security &amp; Compliance',
    a: `<p>Ticket forgery, platform manipulation, identity misrepresentation, bulk automation, or collusion will result in disqualification, prize forfeiture, and possible legal action.</p>
    <p>The Promoter maintains encrypted systems, daily backups, and complies with Nigerian AML/CFT, NDPR, and data-protection laws.</p>`
  },
  {
    q: '10. Liability &amp; Force Majeure',
    a: `<p>The Promoter&rsquo;s liability is limited to the value of the prize won.</p>
    <p>The Promoter is not liable for network failures, incorrect participant details, third-party service issues, or events beyond its reasonable control (Force Majeure).</p>`
  },
  {
    q: '11. Data Protection',
    a: `<p>Personal data is collected only for ticket administration, draws, verification, and regulatory compliance. It is not sold or shared with advertisers. Participants may request access, correction, or deletion after the Raffle ends.</p>`
  },
  {
    q: '12. Dispute Resolution',
    a: `<p>Complaints are handled internally first, then escalated to FCT-LRO. Unresolved disputes go to arbitration in Abuja under the Arbitration and Conciliation Act, with final recourse to the High Court of the FCT.</p>`
  },
  {
    q: '13. General',
    a: `<p>These Terms constitute the entire agreement. Failure to enforce any clause does not constitute a waiver. Invalid clauses are severed without affecting the rest of the document.</p>
    <p>The Promoter may update the Terms with regulatory approval; material changes will be publicly announced.</p>`
  },
];
function renderRaffleTC(){
  const wrap = document.getElementById('raffleTC');
  if(!wrap) return;
  wrap.innerHTML = raffleTerms.map((t, i) => `
    <div class="tc-item">
      <button class="tc-q" onclick="toggleTC(${i})">
        <span>${t.q}</span><span class="plus">+</span>
      </button>
      <div class="tc-a" id="tc-a-${i}">
        <div class="tc-a-inner">${t.a}</div>
      </div>
    </div>
  `).join('');
}
function toggleTC(i){
  const item = document.getElementById('tc-a-' + i).closest('.tc-item');
  item.classList.toggle('open');
}
renderRaffleTC();

// ---------- RAFFLE: TICKET PURCHASE (FLUTTERWAVE) ----------
const TICKET_PRICE = 1000;
function updateTicketSummary(){
  const qtyInput = document.getElementById('ticketQty');
  let qty = parseInt(qtyInput.value, 10);
  if(!qty || qty < 1) qty = 1;
  if(qty > 1000) qty = 1000;
  qtyInput.value = qty;
  document.getElementById('ticketSumQty').textContent = qty;
  document.getElementById('ticketSumTotal').textContent = '₦' + (qty * TICKET_PRICE).toLocaleString();
}
updateTicketSummary();

// Calls a Supabase Edge Function (see supabase/functions/).
async function callRaffleFunction(name, body){
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY},
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function showTicketStatus(title, text){
  document.getElementById('ticketConfirmBox').classList.add('show');
  document.getElementById('ticketConfirmTitle').textContent = title;
  document.getElementById('ticketConfirmText').textContent = text;
}

// ---------- RAFFLE: STEP 1, VALIDATE AND REVIEW ----------
function buyRaffleTickets(){
  const name = document.getElementById('ticketName').value.trim();
  const email = document.getElementById('ticketEmail').value.trim();
  const phone = document.getElementById('ticketPhone').value.trim();
  const qty = parseInt(document.getElementById('ticketQty').value, 10) || 1;
  document.getElementById('ticketFormError').textContent = '';

  if(!name) return formError('ticketFormError', 'ticketName', 'Please enter your full name.');
  if(!isValidEmail(email)) return formError('ticketFormError', 'ticketEmail', 'Please enter a valid email address.');
  if(!isValidPhone(phone)) return formError('ticketFormError', 'ticketPhone', 'Please enter a valid phone number.');

  document.getElementById('ocName').textContent = name;
  document.getElementById('ocEmail').textContent = email;
  document.getElementById('ocPhone').textContent = phone;
  document.getElementById('ocQty').textContent = `${qty} × ₦${TICKET_PRICE.toLocaleString()}`;
  document.getElementById('ocTotal').textContent = '₦' + (qty * TICKET_PRICE).toLocaleString();
  document.getElementById('ocError').textContent = '';

  const agree = document.getElementById('ocAgree');
  const confirmBtn = document.getElementById('ocConfirmBtn');
  agree.checked = false;
  setLoading(confirmBtn, false);
  confirmBtn.disabled = true; // until the eligibility box is ticked
  agree.onchange = () => { confirmBtn.disabled = !agree.checked; };

  const cancel = () => closeModal('orderConfirm');
  document.getElementById('ocCancelBtn').onclick = cancel;
  confirmBtn.onclick = () => startTicketPayment({name, email, phone, qty});
  openModal('orderConfirm', cancel);
}

// ---------- RAFFLE: STEP 2, CREATE ORDER AND PAY ----------
async function startTicketPayment({name, email, phone, qty}){
  const confirmBtn = document.getElementById('ocConfirmBtn');
  const payBtn = document.getElementById('ticketPayBtn');
  setLoading(confirmBtn, true);
  payBtn.disabled = true;

  let order;
  try {
    // The server creates the order and sets the amount, so it can't be tampered with.
    order = await callRaffleFunction('create-ticket-order', {name, email, phone, quantity: qty});
  } catch(err){
    setLoading(confirmBtn, false);
    payBtn.disabled = false;
    document.getElementById('ocError').textContent = err.message;
    return;
  }
  closeModal('orderConfirm');
  setLoading(confirmBtn, false);

  const done = () => { payBtn.disabled = false; };

  if(PAYMENT_MODE === 'simulate'){
    openSimulatedCheckout(order, name, done);
    return;
  }

  if(!(await loadFlutterwave())){
    done();
    formError('ticketFormError', null,
      "Flutterwave's payment window couldn't load. If you use an ad blocker or Brave Shields, turn it off for this site, check your connection, then try again.");
    return;
  }
  FlutterwaveCheckout({
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: order.tx_ref,
    amount: order.amount,
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer',
    customer: {
      email: email,
      phone_number: phone,
      name: name,
    },
    customizations: {
      title: "The Real Mc'Coy Raffle",
      description: order.quantity + ' raffle ticket(s) — 10th Anniversary Draw',
    },
    callback: async function(data){
      setLoading(payBtn, true);
      showTicketStatus('Confirming your payment…', `Reference ${order.tx_ref}. Please keep this page open.`);
      try {
        const result = await callRaffleFunction('verify-ticket-payment', {
          tx_ref: order.tx_ref,
          transaction_id: data.transaction_id,
        });
        showTicketSuccess(result, name, order);
      } catch(err){
        showTicketStatus('Payment received — confirmation pending',
          `${err.message} Your reference is ${order.tx_ref}. If you were charged, your tickets will be issued automatically; contact us with this reference if you don't hear back.`);
      } finally {
        setLoading(payBtn, false);
      }
    },
    onclose: done,
  });
}

// Flutterwave's script is in raffle.html, but on a flaky connection (or with
// a blocker) it may not have loaded. Try once more on demand before giving up.
function loadFlutterwave(){
  if(typeof FlutterwaveCheckout !== 'undefined') return Promise.resolve(true);
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    const timer = setTimeout(() => resolve(false), 15000);
    script.onload = () => { clearTimeout(timer); resolve(typeof FlutterwaveCheckout !== 'undefined'); };
    script.onerror = () => { clearTimeout(timer); resolve(false); };
    document.head.appendChild(script);
  });
}

// ---------- RAFFLE: STEP 3, SUCCESS ----------
function showTicketSuccess(result, name, order){
  const codes = result.tickets;
  const MAX_SHOWN = 120;

  document.getElementById('tsTitle').textContent = result.simulated ? 'Payment confirmed (simulated)' : 'Payment confirmed';
  document.getElementById('tsLead').textContent =
    `${codes.length} ticket${codes.length === 1 ? '' : 's'} issued to ${name}. Good luck in the draw!`;
  document.getElementById('tsAmount').textContent = '₦' + Number(order.amount).toLocaleString();
  document.getElementById('tsRef').textContent = order.tx_ref;

  const shown = codes.slice(0, MAX_SHOWN);
  const codesEl = document.getElementById('tsCodes');
  codesEl.innerHTML = '';
  shown.forEach((code, i) => {
    const chip = document.createElement('span');
    chip.textContent = code;
    chip.style.setProperty('--i', Math.min(i, 20));
    codesEl.appendChild(chip);
  });
  if(codes.length > MAX_SHOWN){
    const more = document.createElement('span');
    more.textContent = `+${codes.length - MAX_SHOWN} more (use Copy)`;
    codesEl.appendChild(more);
  }

  const copyBtn = document.getElementById('tsCopyBtn');
  copyBtn.textContent = 'Copy ticket codes';
  copyBtn.onclick = async () => {
    const text = `The Real Mc'Coy Raffle — ${name}\nReference: ${order.tx_ref}\nTickets: ${codes.join(', ')}`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied ✓';
    } catch {
      copyBtn.textContent = 'Copy failed — please write them down';
    }
  };
  document.getElementById('tsDoneBtn').onclick = () => closeModal('ticketSuccess');

  // Also keep a record on the page after the dialog is closed.
  const list = codes.length <= 10 ? codes.join(', ') : `${codes[0]} … ${codes[codes.length - 1]}`;
  showTicketStatus(result.simulated ? 'Test tickets issued ✓ (simulated payment)' : 'Tickets confirmed ✓',
    `${codes.length} ticket(s) for ${name}: ${list}. Payment reference ${order.tx_ref} — please save it.`);

  openModal('ticketSuccess');
}

// ---------- RAFFLE: SIMULATED CHECKOUT (TESTING ONLY) ----------
// Stands in for the Flutterwave popup when PAYMENT_MODE is 'simulate'.
// The server only accepts it while the SIMULATE_PAYMENTS secret is on.
function openSimulatedCheckout(order, name, onClose){
  const completeBtn = document.getElementById('simCompleteBtn');
  const cancelBtn = document.getElementById('simCancelBtn');
  document.getElementById('simAmount').textContent = '₦' + Number(order.amount).toLocaleString();
  document.getElementById('simQty').textContent = order.quantity;
  document.getElementById('simRef').textContent = order.tx_ref;
  document.getElementById('simError').textContent = '';
  setLoading(completeBtn, false);

  let busy = false;
  function close(){
    if(busy) return;
    closeModal('simCheckout');
    completeBtn.onclick = cancelBtn.onclick = null;
    onClose();
  }
  cancelBtn.onclick = close;
  completeBtn.onclick = async () => {
    busy = true;
    setLoading(completeBtn, true);
    try {
      const result = await callRaffleFunction('simulate-ticket-payment', {tx_ref: order.tx_ref});
      busy = false;
      close();
      showTicketSuccess(result, name, order);
    } catch(err){
      busy = false;
      setLoading(completeBtn, false);
      document.getElementById('simError').textContent = err.message;
    }
  };
  openModal('simCheckout', close);
}

if(PAYMENT_MODE === 'simulate'){
  document.getElementById('ticketPayBtn').textContent = 'Pay (simulated)';
  document.getElementById('ticketTestNote').textContent =
    'Simulation mode — no payment provider is used and no money is taken. Tickets issued this way are marked as test orders.';
}
