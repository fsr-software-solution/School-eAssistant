for(let i=0; i<150; i++) {
    let response = await fetch('http://127.0.0.1:5000/api')
    let responseText = await response.text()
    console.log(`${i+1}. ${responseText}`)    
}