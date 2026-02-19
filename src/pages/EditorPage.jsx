import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useEditor } from '@/hooks/useEditor';
import { useDesignSystems } from '@/hooks/useDesignSystems';
import EditorTopbar from '@/components/editor/EditorTopbar';
import CodePanel from '@/components/editor/CodePanel';
import PdfPreview from '@/components/editor/PdfPreview';
import AiAssistPanel from '@/components/editor/AiAssistPanel';
import LogsPanel from '@/components/editor/LogsPanel';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileNavBar from '@/components/editor/MobileNavBar';
import MobileSettings from '@/components/editor/MobileSettings';

export default function EditorPage() {
  const editor = useEditor();
  const { designSystems } = useDesignSystems();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState('editor');

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <CodePanel
            sourceCode={editor.sourceCode}
            setSourceCode={editor.setSourceCode}
            onCompile={editor.handleCompile}
          />
        );
      case 'preview':
        return (
          <PdfPreview
            pdfUrl={editor.compiledPdfUrl}
            compileStatus={editor.compileStatus}
            compileTime={editor.compileTime}
            onCompile={editor.handleCompile}
          />
        );
      case 'assist':
        return (
          <AiAssistPanel
            messages={editor.assistMessages}
            assistStatus={editor.assistStatus}
            onAssist={editor.handleAssist}
            onClear={editor.clearChatHistory}
          />
        );
      case 'settings':
        return (
          <MobileSettings
            compiler={editor.compiler}
            setCompiler={editor.setCompiler}
            provider={editor.provider}
            setProvider={editor.setProvider}
            designSystemId={editor.designSystemId}
            setDesignSystemId={editor.setDesignSystemId}
            designSystems={designSystems}
          />
        );
      default:
        return null;
    }
  };

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
        isMobile={isMobile}
      />

      {/* Main panels area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {isMobile ? (
          renderMobileContent()
        ) : (
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
        )}

        {/* Logs panel (below all panels - hidden on mobile unless needed, or maybe integrated differently?) */}
        {/* For now, keeping logs panel at bottom for desktop, maybe hide on mobile to save space or move to settings? */}
        {!isMobile && <LogsPanel logs={editor.logs} compileStatus={editor.compileStatus} />}
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && <MobileNavBar activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}
