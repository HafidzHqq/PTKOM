with open("frontend/src/app/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '<div className="mt-4 pt-4 border-t border-gray-100">',
    '''
            {result.metadata && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center text-sm text-blue-800">
                <div>
                  <strong>AI Provider:</strong> {result.metadata.provider} <br />
                  <span className="text-xs text-blue-600">Model: {result.metadata.model}</span>
                </div>
                {result.metadata.usage && (
                  <div className="text-right">
                    <strong>Token Usage:</strong><br />
                    <span className="text-xs">
                      Prompt: {result.metadata.usage.promptTokens} | 
                      Completion: {result.metadata.usage.completionTokens} | 
                      Total: {result.metadata.usage.totalTokens}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-100">'''
)

with open("frontend/src/app/page.tsx", "w") as f:
    f.write(content)
