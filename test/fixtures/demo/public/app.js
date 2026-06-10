const load = () => fetch('/api/items').then(r => r.json())
async function save(item) {
  await fetch('/api/items', { method: 'POST', body: JSON.stringify(item) })
}
const one = (id) => fetch(`/api/items/${id}`)
