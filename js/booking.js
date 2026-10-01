// ---------- BOOKING LOGIC ----------
// Pre-select the unit passed from other pages, e.g. booking.html?unit=Room%2001
function preselectUnit(){
  const name = new URLSearchParams(window.location.search).get('unit');
  if(!name) return;
  const select = document.getElementById('unitSelect');
  for(let opt of select.options){
    if(opt.value.startsWith(name + '|')){ select.value = opt.value; break; }
  }
}

function onUnitChange(){
  const [name, rate, type] = document.getElementById('unitSelect').value.split('|');
  document.getElementById('sumUnit').textContent = name;
  const checkOutGroup = document.getElementById('checkOutGroup');
  checkOutGroup.style.display = (type === 'night') ? 'block' : 'none';
  document.getElementById('sumRateLabel').textContent = type === 'night' ? 'Rate / night' : (type === 'month' ? 'Rate / month' : 'Rate / event');
  document.getElementById('sumNightsLabel').textContent = type === 'night' ? 'Nights' : (type === 'month' ? 'Months' : 'Events');
  updateSummary();
}

function updateSummary(){
  const [name, rate, type] = document.getElementById('unitSelect').value.split('|');
  const rateNum = parseInt(rate, 10);
  let units = 1;
  if(type === 'night'){
    const ci = document.getElementById('checkIn').value;
    const co = document.getElementById('checkOut').value;
    if(ci && co){
      const diff = (new Date(co) - new Date(ci)) / (1000*60*60*24);
      units = diff > 0 ? diff : 1;
    }
  }
  document.getElementById('sumRate').textContent = '₦' + rateNum.toLocaleString();
  document.getElementById('sumNights').textContent = units;
  document.getElementById('sumTotal').textContent = '₦' + (rateNum * units).toLocaleString();
}
document.getElementById('unitSelect').addEventListener('change', onUnitChange);
preselectUnit();
onUnitChange();

// ---------- PAYSTACK (TEST MODE) ----------
function payNow(){
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if(!name || !email || !phone){
    alert('Please fill in your name, email, and phone number before paying.');
    return;
  }
  const totalText = document.getElementById('sumTotal').textContent.replace(/[^0-9]/g,'');
  const amountKobo = parseInt(totalText, 10) * 100;
  const unitName = document.getElementById('sumUnit').textContent;

  const handler = PaystackPop.setup({
    key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // replace with your live Paystack public key
    email: email,
    amount: amountKobo,
    currency: 'NGN',
    ref: 'FOC-' + Math.floor(Math.random()*1000000000),
    metadata: { unit: unitName, name: name, phone: phone },
    callback: function(response){
      document.getElementById('confirmBox').classList.add('show');
      document.getElementById('confirmText').textContent =
        `Reference ${response.reference}. A confirmation for ${unitName} has been sent to ${email}.`;
    },
    onClose: function(){}
  });
  handler.openIframe();
}
