(function () {
  var firebaseConfig = JSON.parse(localStorage.getItem('k4_firebase_config'));
  if (!firebaseConfig) {
      console.error("Firebase config is missing from localStorage. Please start from the React app login page.");
      alert("Configuration missing. Please start from the homepage.");
      window.location.href = '/';
  }

  function init() {
    if (!window.firebase) {
      throw new Error('Firebase SDK failed to load.');
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    return { auth: firebase.auth(), db: firebase.database() };
  }

  function slug(text, fallback) {
    var s = String(text || fallback || 'field')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 48);
    return s || fallback || 'field';
  }

  function collectForm(form) {
    var data = {};
    var used = {};
    form.querySelectorAll('input, select, textarea').forEach(function (el, i) {
      if (el.type === 'file' || el.type === 'password' || el.type === 'button' || el.type === 'submit' || el.type === 'reset') {
        return;
      }
      var label = '';
      if (el.id) {
        label = el.id;
      } else if (el.name) {
        label = el.name;
      } else {
        var wrap = el.closest('div');
        var lab = wrap && wrap.querySelector('label');
        label = lab ? lab.innerText : ('field_' + i);
      }
      var key = slug(label, 'field_' + i);
      if (used[key]) key = key + '_' + i;
      used[key] = true;
      if (el.type === 'checkbox') {
        if (el.checked) {
          if (data[key] === undefined) data[key] = true;
          else data[key] = true;
        }
      } else {
        data[key] = el.value;
      }
    });
    return data;
  }

  function waitForUser(timeoutMs) {
    var auth = init().auth;
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        unsub();
        resolve(null);
      }, timeoutMs || 8000);
      var unsub = auth.onAuthStateChanged(function (user) {
        if (user) {
          clearTimeout(timer);
          unsub();
          resolve(user);
        }
      });
    });
  }

  function saveProfile(opts) {
    var role = opts.role;
    var details = opts.details || {};
    var redirect = opts.redirect;
    var fullName = opts.fullName || details.farmer_name || details.full_legal_name_ || details.full_name || '';
    var phone = opts.phone || details.farmer_phone || details.mobile_number_ || details.phone || '';

    return waitForUser().then(function (user) {
      if (!user) {
        alert('Please log in first so your details can be saved to the database.');
        window.location.href = '/login';
        return;
      }
      var db = init().db;
      var sanitize = function(obj) {
        return JSON.parse(JSON.stringify(obj, function(k, v) {
          if (v === undefined) return null;
          return v;
        }));
      };
      
      var payload = sanitize({
        role: role,
        full_name: fullName || user.displayName || '',
        phone: phone,
        email: user.email || '',
        kycCompleted: true,
        kyc: details,
        updatedAt: new Date().toISOString()
      });
      var pathRole = String(role).toLowerCase();
      return db.ref('users/' + user.uid).update(payload).then(function () {
        var rolePayload = sanitize({
          uid: user.uid,
          email: user.email || '',
          role: role,
          full_name: payload.full_name,
          phone: payload.phone,
          kyc: details,
          createdAt: new Date().toISOString()
        });
        return db.ref(pathRole + 's/' + user.uid).set(rolePayload);
      }).then(function () {
        try { localStorage.setItem('selected_role', role); } catch (e) {}
        window.location.href = redirect;
      });
    }).catch(function (err) {
      console.error(err);
      var msg = (err && err.message) || String(err);
      if (msg.indexOf('PERMISSION_DENIED') !== -1) {
        alert('Could not save: database permission denied. In Firebase Console, set Realtime Database rules to allow authenticated writes.');
      } else {
        alert('Could not save details: ' + msg);
      }
      throw err;
    });
  }

  function autofillForms() {
    waitForUser().then(function(user) {
      if (!user) return;
      var db = init().db;
      db.ref('users/' + user.uid).once('value').then(function(snap) {
        var data = snap.val();
        if (data) {
          // Pre-fill fields by fuzzy matching label text or ID
          var inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
          inputs.forEach(function(el) {
            var label = (el.id || el.name || '').toLowerCase();
            var wrap = el.closest('div');
            var lab = wrap && wrap.querySelector('label');
            if (lab) label += ' ' + lab.innerText.toLowerCase();
            
            if (data.full_name && (label.indexOf('name') !== -1 || label.indexOf('नाम') !== -1)) {
              el.value = data.full_name;
            }
            if (data.phone && (label.indexOf('phone') !== -1 || label.indexOf('mobile') !== -1 || label.indexOf('मोबाइल') !== -1)) {
              el.value = data.phone;
            }
            if (data.email && (label.indexOf('email') !== -1 || label.indexOf('ईमेल') !== -1)) {
              el.value = data.email;
            }
          });
        }
      });
    });
  }

  window.K4Firebase = { init: init, collectForm: collectForm, waitForUser: waitForUser, saveProfile: saveProfile, autofillForms: autofillForms };
})();
