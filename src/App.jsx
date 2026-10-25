function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#0f172a',
      color: '#f8fafc'
    }}>
      <h1>CampusHub - Web Arayüzü</h1>
      <p style={{ color: '#94a3b8' }}>Frontend (Kullanıcı Akışı) İskeleti Hazır!</p>
      <button style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '15px'
      }} onClick={() => alert('CampusHub Frontend Çalışıyor!')}>
        Sisteme Giriş Yap
      </button>
    </div>
  )
}

export default App