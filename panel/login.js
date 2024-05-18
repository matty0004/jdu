if (location.protocol === 'http:') {
    document.querySelector('.info').innerHTML = "Please Use https:// protocol to open site, or your auth will be leaked"
  }

const username = document.getElementById('fusername');
username.addEventListener('input', () => {
    username.setAttribute('value', username.value);
});

const password = document.getElementById('fpassword');
password.addEventListener('input', () => {
    password.setAttribute('value', password.value);
});

function login() {
    var q = `a=${encodeURIComponent(username.value)}&b=${encodeURIComponent(password.value)}`
    document.querySelector('body').classList.add('fetch')
    document.querySelector('.info').innerHTML = "Fetching Please Wait..."
    fetch(`api/auth?${q}`, {
        method: 'POST'
    })
        .then(response => {
            document.querySelector('.info').innerHTML = "Try Again"
            if (response.status === 200) { window.location.href = 'index.html'; }
            if (response.status === 403) { document.querySelector('.info').innerHTML = "Access Denied" }
            if (response.status === 500) { document.querySelector('.info').innerHTML = "nternal Server Error" }
            document.querySelector('body').classList.remove('fetch')
        });
    localStorage.setItem('q', q);
}