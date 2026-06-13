
import { useDropzone } from 'react-dropzone'

function useMyDropzone(setTheFiles, setTheFilesUrl, maxNumberOfFiles = 1, maxSizeOfFile) {


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        maxFiles: maxNumberOfFiles,
        maxSize: maxSizeOfFile ? maxSizeOfFile : 5 * 1024 * 1024,
        onDrop: (files) => {
            setTheFiles(files);
            setTheFilesUrl(
                files.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );
        }
    });

    return { getRootProps, getInputProps, isDragActive };
}

export default useMyDropzone;