import { useRef } from 'react'

function CaptureButton({ teamColor, onCapture }) {
  const fileInputRef = useRef(null);

  function handleClick() {
    fileInputRef.current?.click();
  }
  
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      // Determine if it's photo or video based on file type
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'video' : 'photo';
      onCapture(type, file);
    }
    // Reset the input
    event.target.value = '';
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          background: teamColor,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 64,
          height: 64,
          boxShadow: '0 4px 16px #0003',
          fontSize: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          transition: 'background 0.2s',
        }}
        aria-label="Upload Media"
      >
        +
      </button>

      {/* Hidden file input for gallery selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </>
  );
}

export default CaptureButton 