import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useEditor } from '@/hooks/useEditor';
import { useDesignSystems } from '@/hooks/useDesignSystems';
import EditorTopbar from '@/components/editor/EditorTopbar';
import CodePanel from '@/components/editor/CodePanel';
import PdfPreview from '@/components/editor/PdfPreview';
import AiAssistPanel from '@/components/editor/AiAssistPanel';
import LogsPanel from '@/components/editor/LogsPanel';

export default function EditorPage() {
  const editor = useEditor();
  const { designSystems } = useDesignSystems();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Topbar */}
      <EditorTopbar
        compiler={editor.compiler}
        setCompiler={editor.setCompiler}
        provider={editor.provider}
        setProvider={editor.setProvider}
        designSystemId={editor.designSystemId}
        setDesignSystemId={editor.setDesignSystemId}
        designSystems={designSystems}
        compileStatus={editor.compileStatus}
        onCompile={editor.handleCompile}
      />

      {/* Main panels area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Code editor */}
          <ResizablePanel defaultSize={35} minSize={20}>
            <CodePanel
              sourceCode={editor.sourceCode}
              setSourceCode={editor.setSourceCode}
              onCompile={editor.handleCompile}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* PDF preview */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <PdfPreview
              pdfUrl={editor.compiledPdfUrl}
              compileStatus={editor.compileStatus}
              compileTime={editor.compileTime}
              onCompile={editor.handleCompile}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* AI assistant */}
          <ResizablePanel defaultSize={25} minSize={18}>
            <AiAssistPanel
              messages={editor.assistMessages}
              assistStatus={editor.assistStatus}
              onAssist={editor.handleAssist}
              onClear={editor.clearChatHistory}
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Logs panel (below all panels) */}
        <LogsPanel logs={editor.logs} compileStatus={editor.compileStatus} />
      </div>
    </div>
  );
}
