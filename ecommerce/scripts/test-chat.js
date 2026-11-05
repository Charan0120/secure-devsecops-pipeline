async function test() {
  const p1 = await fetch('http://localhost:4000/api/chat/predefined-prompts').then(r => r.json());
  console.log('Predefined prompts count:', p1.total);

  const rPre = await fetch('http://localhost:4000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Tell me about the Aura Studio Wireless Headphones' })
  }).then(r => r.json());
  console.log('Predefined test:', { isPredefined: rPre.isPredefined, isSecurityAnomaly: rPre.isSecurityAnomaly, answerPrefix: rPre.answer?.slice(0, 50) });

  const rSqli = await fetch('http://localhost:4000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: "' UNION SELECT * FROM users --" })
  }).then(r => r.json());
  console.log('SQLi test:', { isSecurityAnomaly: rSqli.isSecurityAnomaly, event: rSqli.securityEvent });

  const rGeneral = await fetch('http://localhost:4000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'What is your favorite color and movie?' })
  }).then(r => r.json());
  console.log('Non-predefined generic test:', { isSecurityAnomaly: rGeneral.isSecurityAnomaly, event: rGeneral.securityEvent });

  const evts = await fetch('http://localhost:4000/api/security/chatbot-events').then(r => r.json());
  console.log('DevSecOps DB Chatbot Security Events total:', evts.total, evts.events.map(e => ({ risk: e.riskCategory, sev: e.severity, prompt: e.prompt })));
}
test();
