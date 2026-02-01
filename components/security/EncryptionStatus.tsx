'use client'

interface EncryptionStatusProps {
  testCode: string
  encrypted: boolean
  lastEncrypted?: Date
}

export default function EncryptionStatus({ 
  testCode, 
  encrypted, 
  lastEncrypted 
}: EncryptionStatusProps) {
  const getKeyPreview = (code: string) => {
    return `AES-256-GCM(${code.substring(0, 3)}•••${code.substring(3)})`
  }
  
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Encryption Status</h4>
        <div className={`px-2 py-1 rounded text-xs ${
          encrypted 
            ? 'bg-green-900/30 text-green-400 border border-green-700' 
            : 'bg-red-900/30 text-red-400 border border-red-700'
        }`}>
          {encrypted ? 'ENCRYPTED' : 'NOT ENCRYPTED'}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Algorithm:</span>
          <span className="font-mono">AES-GCM 256-bit</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Key:</span>
          <span className="font-mono text-accent">{getKeyPreview(testCode)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Location:</span>
          <span className="text-green-400">Client-side only</span>
        </div>
        
        {lastEncrypted && (
          <div className="flex justify-between">
            <span className="text-gray-400">Last Encrypted:</span>
            <span>{lastEncrypted.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs text-gray-400">
          <p>• All data encrypted before leaving your browser</p>
          <p>• Server cannot read test content</p>
          <p>• Test code acts as encryption key</p>
        </div>
      </div>
    </div>
  )
}