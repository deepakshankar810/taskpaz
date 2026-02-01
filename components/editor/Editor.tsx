'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { common, createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Highlighter,
    List, ListOrdered,
    Code, Link as LinkIcon, CheckSquare, Minus,
    Undo, Redo, Minus as MinusIcon, Plus as PlusIcon
} from 'lucide-react';
import { useEffect } from 'react';

// Add prism styles for code highlights
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight(common);

// Custom Font Size Extension
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: (attributes: any) => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        } as any;
    },
});

interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('URL');
        if (url) {
            // Ensure URL has protocol
            const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
            editor.chain().focus().setLink({ href: finalUrl }).run();
        }
    };

    const ToolbarButton = ({ onClick, disabled, isActive, children, title, className = "" }: any) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={`h-8 w-8 p-0 rounded-md transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} ${className}`}
            title={title}
        >
            {children}
        </Button>
    );

    const ToolbarDivider = () => <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />;

    const currentFontSize = parseInt(editor.getAttributes('textStyle').fontSize || '16');

    return (
        <div className="border-b bg-white dark:bg-slate-950 p-2 flex flex-wrap items-center gap-0.5 sticky top-0 z-30 shadow-sm border-slate-100 dark:border-slate-800 rounded-t-lg">
            {/* History Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Font Size Group */}
            <div className="flex items-center gap-1 px-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().setFontSize(`${currentFontSize - 1}px`).run()}
                    title="Decrease Font Size"
                >
                    <MinusIcon className="h-3 w-3" />
                </ToolbarButton>
                <span className="text-xs font-bold w-6 text-center text-slate-700 dark:text-slate-300">
                    {currentFontSize}
                </span>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setFontSize(`${currentFontSize + 1}px`).run()}
                    title="Increase Font Size"
                >
                    <PlusIcon className="h-3 w-3" />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Text Style Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Alignment Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    title="Align Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Lists Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    title="Task List"
                >
                    <CheckSquare className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Insert Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Insert Link">
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Divider"
                >
                    <Minus className="h-4 w-4" />
                </ToolbarButton>
            </div>
        </div>
    );
};

export default function Editor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: 'list-disc pl-4 space-y-1',
                },
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: 'list-decimal pl-4 space-y-1',
                },
            }),
            ListItem,
            Underline,
            Link.configure({
                openOnClick: true, // Now true to allow clicking inserted URLs
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: {
                    class: 'text-indigo-600 dark:text-indigo-400 underline decoration-indigo-600/30 underline-offset-4 cursor-pointer hover:text-indigo-700 transition-colors'
                }
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            HorizontalRule,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight,
            FontSize,
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert prose-base sm:prose-lg focus:outline-none max-w-none min-h-[500px] w-full px-6 py-8 outline-none',
            },
        },
    });

    // Only sync content from props to editor on "external" changes
    useEffect(() => {
        if (!editor || content === editor.getHTML()) return;

        // Use a more robust check for content differences to avoid infinite loops
        // If the editor is focused, we assume the user is typing and we don't overwrite
        if (!editor.isFocused) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor && editor.isEditable !== editable) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`flex flex-col h-full rounded-lg ${editable ? 'bg-white dark:bg-slate-950' : ''}`}>
            {editable && <MenuBar editor={editor} />}
            <div className={`flex-1 overflow-auto ${editable ? 'p-2' : ''}`}>
                <EditorContent
                    editor={editor}
                    className="outline-none"
                />
            </div>
        </div>
    );
}
