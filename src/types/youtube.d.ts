declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: {
            Player: new (
                elementId: HTMLElement,
                options: {
                    videoId: string;
                    playerVars: {
                        autoplay: number;
                        controls: number;
                        rel: number;
                        showinfo: number;
                        modestbranding: number;
                    };
                    events: {
                        onReady: () => void;
                        onError: () => void;
                    };
                }
            ) => {
                stopVideo: () => void;
                destroy: () => void;
            };
        };
    }
}

export {}; 
