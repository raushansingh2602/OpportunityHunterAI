const BACKEND_URL = "http://localhost:8000";

// Helpers
function qs(id){return document.getElementById(id)}
function show(el){el.classList.remove('hidden')}
function hide(el){el.classList.add('hidden')}

function validateProfile(){
  const errors = []
  const name = qs('name').value.trim()
  const branch = qs('branch').value.trim()
  const year = Number(qs('year').value)
  const cgpa = Number(qs('cgpa').value)
  const skills = qs('skills').value.split(',').map(s=>s.trim()).filter(Boolean)
  const location = qs('location').value.trim()
  const mode = qs('preferred_mode').value
  const stipend = Number(qs('minimum_stipend').value)

  if(!name) errors.push('Name is required')
  if(!branch) errors.push('Branch is required')
  if(!year || year<1) errors.push('Year must be a number')
  if(isNaN(cgpa) || cgpa<0 || cgpa>10) errors.push('CGPA must be 0-10')
  if(skills.length===0) errors.push('Enter at least one skill')
  if(!location) errors.push('Location is required')
  if(!mode) errors.push('Preferred mode is required')
  if(isNaN(stipend) || stipend<0) errors.push('Minimum stipend must be a number')

  return {ok: errors.length===0, errors, data:{name,branch,year,cgpa,skills,location,preferred_mode:mode,minimum_stipend:stipend}}
}

function setFormError(msg){qs('form-error').textContent = msg}

function renderAgentEvents(events){
  const el = qs('agent-events'); el.innerHTML = ''
  const status = qs('agent-status')
  let i=0
  function iconForType(t){switch(t){case 'search':return '🔎';case 'open':return '🌐';case 'extract':return '📄';case 'reject':return '❌';case 'success':return '⭐';default: return '🤖'}}

  // show sequentially with small delay
  function showNext(){
    if(i>=events.length) return
    const ev = events[i++]
    const li = document.createElement('li')
    li.innerHTML = `<span style="font-size:18px;margin-right:6px">${iconForType(ev.type||'')}</span><div><div style="font-weight:600">${ev.message}</div><div style="font-size:12px;color:var(--muted)">${ev.url||''}</div></div>`
    el.appendChild(li)
    el.scrollTop = el.scrollHeight
    // update status
    status.textContent = ev.type==='success'?`⭐ ${ev.message}`:`${iconForType(ev.type)} ${ev.message}`
    setTimeout(showNext, 300)
  }
  // start animation
  if(events.length===0){status.textContent = 'No agent events available'; return}
  status.textContent = 'Displaying agent activity...'
  showNext()
}

function renderOpportunities(list){
  const container = qs('opportunities'); container.innerHTML=''
  if(!list || list.length===0){container.innerHTML = `<div class="card"><p>No matching opportunities found. Try adjusting your skills, location, or stipend.</p></div>`; return}
  list.forEach(op=>{
    const div = document.createElement('div'); div.className='card-opportunity'
    const title = document.createElement('div'); title.className='op-title'; title.textContent = op.title || 'Untitled'
    const comp = document.createElement('div'); comp.className='op-company'; comp.textContent = op.company || ''
    const badge = document.createElement('div'); badge.className='match-badge'; badge.textContent = (op.match_score||0)+"% Match"
    const meta = document.createElement('div'); meta.className='meta'; meta.innerHTML = `${op.stipend? '&#8377;'+op.stipend:''} ${op.location? ' • '+op.location : ''} ${op.deadline? ' • Deadline: '+op.deadline : ''}`
    const skillsDiv = document.createElement('div'); skillsDiv.className='skills'
    const matched = op.matched_skills||[]; const missing = op.missing_skills||[]
    matched.forEach(s=>{const sp=document.createElement('div');sp.className='skill';sp.textContent='✓ '+s;skillsDiv.appendChild(sp)})
    missing.forEach(s=>{const sp=document.createElement('div');sp.className='skill';sp.textContent='• '+s;skillsDiv.appendChild(sp)})

    const actions = document.createElement('div'); actions.className='op-actions'
    const viewBtn = document.createElement('button'); viewBtn.className='btn-plain'; viewBtn.textContent='View Details'; viewBtn.onclick=()=>openDetailsModal(op)
    const applyBtn = document.createElement('button'); applyBtn.className='btn-plain'; applyBtn.textContent='Apply'
    if(op.url){applyBtn.onclick=()=>window.open(op.url,'_blank','noopener');} else {applyBtn.disabled=true;applyBtn.textContent='Application link unavailable'}

    actions.appendChild(viewBtn); actions.appendChild(applyBtn)

    div.appendChild(title); div.appendChild(comp); div.appendChild(badge); div.appendChild(meta); div.appendChild(skillsDiv); div.appendChild(actions)
    container.appendChild(div)
  })
}

function openDetailsModal(op){
  const modal = qs('modal'); const body = qs('modal-body'); body.innerHTML=''
  const h = document.createElement('div')
  h.innerHTML = `<h3>${op.title||''}</h3><div class="op-company">${op.company||''}</div>`
  const content = document.createElement('div')
  content.innerHTML = `
    <p>${op.description||''}</p>
    <p><strong>Requirements:</strong> ${(op.requirements||[]).join(', ')}</p>
    <p><strong>Stipend:</strong> ${op.stipend||'N/A'}</p>
    <p><strong>Location:</strong> ${op.location||'N/A'}</p>
    <p><strong>Duration:</strong> ${op.duration||'N/A'}</p>
    <p><strong>Deadline:</strong> ${op.deadline||'N/A'}</p>
    <p><strong>Match Score:</strong> ${op.match_score||0}%</p>
    <p><strong>Eligibility:</strong> ${op.eligible? '<span class="badge-eligible">✓ Eligible</span>':'<span class="badge-ineligible">✕ Not Eligible</span>'}</p>
    <p><strong>Matched Skills:</strong> ${(op.matched_skills||[]).join(', ') || 'None'}</p>
    <p><strong>Missing Skills:</strong> ${(op.missing_skills||[]).join(', ') || 'None'}</p>
    <p><strong>Reasons:</strong> ${(op.reasons||[]).join('; ') || 'None'}</p>
    <p><strong>Warnings:</strong> ${(op.warnings||[]).join('; ') || 'None'}</p>
    <p><strong>AI Explanation:</strong> ${op.explanation||'N/A'}</p>
    <p><strong>Source:</strong> ${op.source||''}</p>
  `
  const apply = document.createElement('div'); apply.style.marginTop='12px'
  const applyBtn = document.createElement('button'); applyBtn.className='btn-plain'; applyBtn.textContent='Open Application'
  if(op.url){applyBtn.onclick=()=>window.open(op.url,'_blank','noopener,noreferrer')} else {applyBtn.disabled=true;applyBtn.textContent='Application link unavailable'}
  apply.appendChild(applyBtn)
  body.appendChild(h); body.appendChild(content); body.appendChild(apply)
  show(modal)
}

function closeModal(){hide(qs('modal'))}

qs('modal-close').addEventListener('click', closeModal)

async function submitSearch(ev){
  ev.preventDefault()
  setFormError('')
  const submitBtn = qs('submitBtn')
  const validate = validateProfile()
  if(!validate.ok){ setFormError(validate.errors.join('. ')); return }
  // disable
  submitBtn.disabled = true; submitBtn.textContent = 'Agent is working...'
  // show agent section
  show(qs('agent-section'))
  qs('agent-status').textContent = '🤖 Agent started'
  qs('agent-events').innerHTML = ''
  hide(qs('results-section'))

  try{
    const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(), 60000)
    const res = await fetch(BACKEND_URL + '/api/search', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(validate.data), signal:controller.signal
    })
    clearTimeout(timeout)
    if(!res.ok){ throw new Error('network') }
    const data = await res.json()
    // show events sequentially
    renderAgentEvents(data.agent_events||[])
    // after events animation delay, show summary
    setTimeout(()=>{
      show(qs('results-section'))
      qs('summary').innerHTML = `
        <div class="stat"><strong>${data.total_found||0}</strong>Found</div>
        <div class="stat"><strong>${data.total_analyzed||0}</strong>Analyzed</div>
        <div class="stat"><strong>${data.total_eligible||0}</strong>Eligible</div>
        `
      renderOpportunities(data.opportunities||[])
      qs('agent-status').textContent = '✅ Agent finished'
      submitBtn.disabled = false; submitBtn.textContent = 'Search Again'
      submitBtn.onclick = resetSearch
    }, Math.max(500, (data.agent_events||[]).length * 320))

  }catch(err){
    console.error(err)
    show(qs('results-section'))
    qs('summary').innerHTML = `<div class="stat"><strong>0</strong>Found</div>`
    qs('opportunities').innerHTML = `<div class="card"><p>Agent encountered an issue. Please try again.</p></div>`
    setFormError('Agent encountered an issue. Please try again.')
    qs('agent-status').textContent = '⚠️ Agent error'
    submitBtn.disabled = false; submitBtn.textContent = '🚀 Find Opportunities'
  }
}

function resetSearch(){
  hide(qs('agent-section')); hide(qs('results-section'))
  qs('profile-form').reset(); qs('form-error').textContent = ''
  qs('submitBtn').textContent = '🚀 Find Opportunities'; qs('submitBtn').disabled=false; qs('submitBtn').onclick = (e)=>submitSearch(e)
}

function init(){
  qs('profile-form').addEventListener('submit', submitSearch)
  qs('submitBtn').addEventListener('click', (e)=>{})
  // modal close on backdrop
  qs('modal').addEventListener('click',(ev)=>{ if(ev.target.id==='modal') closeModal() })
}

document.addEventListener('DOMContentLoaded', init)
