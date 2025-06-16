import { Heart, Star, AlarmClock } from 'lucide-react';

const IconCard = () => {
  return (
    <div className="icon-card" style={styles.card}>
      <h2>Lucide React Icons</h2>
      <div style={styles.iconRow}>
        <Heart color="red" size={32} />
        <Star color="gold" size={32} />
        <AlarmClock color="blue" size={32} />
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    width: '300px',
    margin: '20px auto',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '15px',
  },
};

export default IconCard;
