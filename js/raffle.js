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

function buyRaffleTickets(){
  const name = document.getElementById('ticketName').value.trim();
  const email = document.getElementById('ticketEmail').value.trim();
  const phone = document.getElementById('ticketPhone').value.trim();
  const qty = parseInt(document.getElementById('ticketQty').value, 10) || 1;
  if(!name || !email || !phone){
    alert('Please fill in your name, email, and phone number before paying.');
    return;
  }
  const amount = qty * TICKET_PRICE;
  const txRef = 'RAFFLE-' + Date.now() + '-' + Math.floor(Math.random()*100000);

  FlutterwaveCheckout({
    public_key: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx-X', // replace with your live Flutterwave public key
    tx_ref: txRef,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer',
    customer: {
      email: email,
      phone_number: phone,
      name: name,
    },
    customizations: {
      title: "The Real Mc'Coy Raffle",
      description: qty + ' raffle ticket(s) — 10th Anniversary Draw',
    },
    callback: function(data){
      document.getElementById('ticketConfirmBox').classList.add('show');
      document.getElementById('ticketConfirmText').textContent =
        `Reference ${data.tx_ref || data.transaction_id}. ${qty} ticket(s) for ${name} confirmed. A receipt has been sent to ${email}.`;
    },
    onclose: function(){},
  });
}
