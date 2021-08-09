

$(() => {
  const crypto = require('crypto')
  const clipboard = require('electron').clipboard

  let publicCertificatePem = '';
  let cert = '';
  let privateKeyValue =  '';
  let passphraseValue =  '';
  let email = '';
  let expTime = '';
  let algorithm = 'RS256';


  $('#public-certificate-input').on('input', function() {
    publicCertificatePem = this.value;
    cert = removeCertStartEndString(publicCertificatePem.toString('ascii'));
    updatePayloadJson();
    updateProtectedJson();
    $('#public-certificate-input').focus()
  });

  $('#private-key-input').on('input', function() {
    privateKeyValue = this.value.toString('ascii')
    updatePayloadJson();
    updateProtectedJson();
    $('#private-key-input').focus()
  });

  $('#passphrase-input').on('input', function() {
    passphraseValue = this.value;
    updatePayloadJson();
    updateProtectedJson();
    $('#passphrase-input').focus()
  });

  $('#email-input').on('input', function() {
    email = this.value;
    updatePayloadJson();
    $('#email-input').focus()
  });

  $('#epoc-time-input').on('input property change', function() {
    expTime = this.value;
    updatePayloadJson();
    $('#epoc-time-input').focus()
  });

  $('#algorithm-input').on('select property change', function() {
    algorithm = this.value;
    updateProtectedJson();
    $('#algorithm-input').focus()
  });

  $('#copy-request').click( 'button', function (){
    clipboard.writeText(request());
  });

  const updateProtectedJson =() => {
    $('#protected-output').text(protectedJson());
    $('#protected-cert-encoded').text(protectedBase64Json());
    $('#protected-base64url-encoded').text(protectedBase64UrlJson());
    $('#signing-string').text(signingString());
    $('#signing').text(signing());
    $('#signing-base64url-encoded').text(encodeToBase64Url(signing()));
    $('#request-output').text(request());

  };

  const updatePayloadJson =() => {
    $('#payload-output').text(payloadJson());
    $('#payload-base64url-encoded').text(payloadBase64UrlJson());
    $('#signing-string').text(signingString());
    $('#signing').text(signing());
    $('#signing-base64url-encoded').text(encodeToBase64Url(signing()));
    $('#request-output').text(request());
  };

  const request = () => {
    return JSON.stringify({
      protected: protectedBase64UrlJson(),
      payload: payloadBase64UrlJson(),
      signature: encodeToBase64Url(signing()),
    });
  }
  const  protectedJson = () =>{
    return JSON.stringify({ alg: algorithm, x5c: cert });
  }

  const  protectedBase64UrlJson = () =>{
    return encodeToBase64Url(protectedBase64Json());
  }

  const  protectedBase64Json = () =>{
    const buff =Buffer.from(cert, 'utf-8');
    return JSON.stringify({ alg: algorithm, x5c: buff.toString('base64') });
  }



  const  payloadBase64UrlJson = () =>{
    return encodeToBase64Url(JSON.stringify({ ptc_email: email, exp: expTime }));
  }

  const  payloadJson = () =>{
    return JSON.stringify({ ptc_email: email, exp: expTime });
  }

  const  signingString = () =>{
    return protectedBase64UrlJson() +'.'+payloadBase64UrlJson();
  }

  const signing = () => {
    return getSignatureByInput(signingString());
  }


  function encodeToBase64Url(input ='') {
    const buff = Buffer.from(input, 'utf-8');
    return buff.toString('base64')
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
  }

  function removeCertStartEndString(publicCertificate ='')  {
    publicCertificate = publicCertificate.replace(/-----BEGIN CERTIFICATE-----\n/ig, '');
    publicCertificate = publicCertificate.replace(/-----END CERTIFICATE-----\n/ig, "");
    return publicCertificate;
  }


  const getSignatureByInput = (input) => {
    sign = crypto.createSign('RSA-SHA256')
    sign.update(input)
    let signature = sign.sign({ key: privateKeyValue, passphrase: passphraseValue }, 'hex')
    return signature
  };

  updatePayloadJson();
  updateProtectedJson();


})

