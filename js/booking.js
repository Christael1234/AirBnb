// ---------- BOOKING LOGIC ----------
// Pre-select the unit passed from other pages, e.g. /booking?unit=Room%2001
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
const formatDate = v => new Date(v + 'T00:00:00').toLocaleDateString('en-NG', {dateStyle: 'medium'});

// Step 1: validate, then show the confirmation dialog.
function payNow(){
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const [unitName, , type] = document.getElementById('unitSelect').value.split('|');
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  document.getElementById('bookingFormError').textContent = '';

  if(!checkIn) return formError('bookingFormError', 'checkIn', 'Please choose a date.');
  if(type === 'night'){
    if(!checkOut) return formError('bookingFormError', 'checkOut', 'Please choose a check-out date.');
    if(checkOut <= checkIn) return formError('bookingFormError', 'checkOut', 'Check-out must be after check-in.');
  }
  if(!name) return formError('bookingFormError', 'fullName', 'Please enter your full name.');
  if(!isValidPhone(phone)) return formError('bookingFormError', 'phone', 'Please enter a valid phone number.');
  if(!isValidEmail(email)) return formError('bookingFormError', 'email', 'Please enter a valid email address.');

  const total = document.getElementById('sumTotal').textContent;
  document.getElementById('bcUnit').textContent = unitName;
  document.getElementById('bcDatesLabel').textContent = type === 'night' ? 'Dates' : (type === 'month' ? 'Start date' : 'Event date');
  document.getElementById('bcDates').textContent = type === 'night' ? `${formatDate(checkIn)} → ${formatDate(checkOut)}` : formatDate(checkIn);
  document.getElementById('bcUnitsLabel').textContent = document.getElementById('sumNightsLabel').textContent;
  document.getElementById('bcUnits').textContent = document.getElementById('sumNights').textContent;
  document.getElementById('bcName').textContent = name;
  document.getElementById('bcEmail').textContent = email;
  document.getElementById('bcTotal').textContent = total;

  const cancel = () => closeModal('bookingConfirm');
  document.getElementById('bcCancelBtn').onclick = cancel;
  document.getElementById('bcConfirmBtn').onclick = () => {
    closeModal('bookingConfirm');
    startPaystack({name, email, phone, unitName, total});
  };
  openModal('bookingConfirm', cancel);
}

// Step 2: Paystack checkout.
function startPaystack({name, email, phone, unitName, total}){
  const amountKobo = parseInt(total.replace(/[^0-9]/g, ''), 10) * 100;
  const payBtn = document.getElementById('bookingPayBtn');
  setLoading(payBtn, true);

  if(typeof PaystackPop === 'undefined'){
    setLoading(payBtn, false);
    formError('bookingFormError', null, "Payment couldn't load. Check your connection and try again.");
    return;
  }
  const handler = PaystackPop.setup({
    key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // replace with your live Paystack public key
    email: email,
    amount: amountKobo,
    currency: 'NGN',
    ref: 'FOC-' + Math.floor(Math.random()*1000000000),
    metadata: { unit: unitName, name: name, phone: phone },
    // Step 3: success dialog.
    callback: function(response){
      setLoading(payBtn, false);
      document.getElementById('bsLead').textContent = `Thank you, ${name}. Your payment for ${unitName} went through.`;
      document.getElementById('bsAmount').textContent = total;
      document.getElementById('bsRef').textContent = response.reference;
      document.getElementById('bsDoneBtn').onclick = () => closeModal('bookingSuccess');
      document.getElementById('confirmBox').classList.add('show');
      document.getElementById('confirmText').textContent =
        `Reference ${response.reference}. Payment for ${unitName} received — keep this reference for your records.`;
      openModal('bookingSuccess');
    },
    onClose: function(){ setLoading(payBtn, false); }
  });
  handler.openIframe();
}
