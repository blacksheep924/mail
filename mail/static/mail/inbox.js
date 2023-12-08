document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  // By default, load the inbox
  load_mailbox('inbox');

  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-content').style.display = 'none';
  
  

  // Clear out composition fields
  
  document.querySelector('#compose-recipients').value = `${recipient}`;
  document.querySelector('#compose-subject').value = `Re : ${subject}`;
  document.querySelector('#compose-body').value =`On ${timestamp} ${recipient} wrote : "${body}\n `;

}

function send_email(event) {
  event.preventDefault()
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body =  document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
    load_mailbox('inbox')
});
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-content').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'initial';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(email => {
      console.log(email)

      
      
      const newEmail = document.createElement('p');
      newEmail.innerHTML = `
      <p > <strong>${email.sender}</strong> </p><p>${email.subject}</p><p >${email.timestamp}</p>
      `;

      newEmail.classList.add('flexContainer');

      if (email.read === true) { 
        newEmail.style.backgroundColor = 'grey';
      }

      else{
        newEmail.style.backgroundColor = 'white';
      }
      

      


      const emailID = email.id;
     
      document.querySelector('#emails-view').append(newEmail);
      newEmail.addEventListener('click', function() {
        
        viewEmail(emailID,mailbox);
        fetch(`/emails/${emailID}`, {
          method: 'PUT',
          body: JSON.stringify({
            
            read : true
          })
        })
        .then(response => response.json())
  .then(data => {
    // Handle the response data if needed
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
        

      });
   
    });
    // ... do something else with emails ...
});

}

function viewEmail(emailID,mailbox) {
  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-content').style.display = 'initial';

    content = document.querySelector('#emails-content');

    content.innerHTML = `
    <p><strong>From : </strong>${emails.sender}</p>
    <p><strong>To : </strong>${emails.recipients}</p>
    <p><strong>Subject : </strong>${emails.subject}</p>
    <p><strong>Timestamp : </strong>${emails.timestamp}</p>
    <p><button id="reply">Reply</button>      <button id="archive">Archive</button></p>
    <p><strong></strong>${emails.body}</p>
    
    `
    archiveButton = document.querySelector('#archive');
    replyButton = document.querySelector('#reply');
    let condition = true;
    
    if (emails.archived === true){

      archiveButton.innerHTML = 'Unarchive';
      
      condition = false;

    }
    else {
      condition = true;
    }

    if( mailbox === 'sent'){

      archiveButton.style.display = 'none';
      replyButton.style.display = 'none';

    }
    
    archiveButton.addEventListener('click', function (){
      
    fetch(`/emails/${emailID}`, {
      method: 'PUT',
      body: JSON.stringify({
        
        archived : condition
      })
    })
    .then(response => response.json())
    .then( data => {
// Handle the response data if needed
console.log(data);
    
      })
.catch(error => {
console.error('Error:', error);
load_mailbox('inbox');
    });
  
  });
  replyButton = document.querySelector('#reply');
  replyButton.addEventListener('click', function (){
    recipient = emails.sender;
    subject = emails.subject;
    body = emails.body
    timestamp = emails.timestamp;
    compose_email(recipient,subject,body);



  })


});

}


