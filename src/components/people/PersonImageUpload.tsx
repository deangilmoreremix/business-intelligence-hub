import { useState } from 'react';
import { SettingsImageInput } from '@/settings/components/SettingsImageInput';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { FileFolder } from '~/generated-metadata/graphql';
import { TwentyProviders } from '../../vendor/twenty-adapter/TwentyProviders';
import { setUploadFolder } from '../../vendor/twenty-adapter/fileUpload';
import { useTheme } from '../../contexts/ThemeContext';
import './people.css';

type Props = {
  folder: 'contacts' | 'team' | 'companies';
  value: string | null | undefined;
  onChange: (url: string | null) => void | Promise<void>;
  disabled?: boolean;
};

/** Twenty's own avatar upload control (SettingsImageInput + useDirectFileUpload), stored in Supabase Storage. */
const Inner = ({ folder, value, onChange, disabled }: Props) => {
  const { uploadFile } = useDirectFileUpload();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  return (
    <SettingsImageInput
      picture={value}
      disabled={disabled}
      isUploading={uploading}
      errorMessage={error}
      onFileSelect={async file => {
        const ac = new AbortController();
        setController(ac); setError(null); setUploading(true); setUploadFolder(folder);
        try {
          const uploaded = await uploadFile(file, { fileFolder: FileFolder.CorePicture, signal: ac.signal });
          await onChange(uploaded.url);
        } catch (e) {
          if (!ac.signal.aborted) setError(e instanceof Error ? e.message : 'Upload failed');
        } finally { setUploading(false); setController(null); }
      }}
      onAbort={() => controller?.abort()}
      onRemove={async () => { setError(null); await onChange(null); }}
    />
  );
};

export const PersonImageUpload = (props: Props) => {
  const { isDark } = useTheme();
  return <div className="people-image-upload" data-testid={`image-upload-${props.folder}`}><TwentyProviders dark={isDark}><Inner {...props} /></TwentyProviders></div>;
};
