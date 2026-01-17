declare module 'ssh2-sftp-client' {
    import * as ssh2 from 'ssh2';

    export interface FileInfo {
        type: string;
        name: string;
        size: number;
        modifyTime: number;
        accessTime: number;
        rights: {
            user: string;
            group: string;
            other: string;
        };
        owner: number;
        group: number;
    }

    export default class Client {
        connect(options: ssh2.ConnectConfig): Promise<void>;
        list(remoteFilePath: string): Promise<FileInfo[]>;
        exists(remoteFilePath: string): Promise<string | false | 'd' | 'l' | '-'>;
        get(remoteFilePath: string, useCompression?: boolean, encoding?: string | null): Promise<Buffer | NodeJS.ReadableStream>;
        fastGet(remoteFilePath: string, localFilePath: string, options?: ssh2.FastGetTransferOptions): Promise<string>;
        put(input: string | Buffer | NodeJS.ReadableStream, remoteFilePath: string, options?: ssh2.TransferOptions): Promise<string>;
        fastPut(localFilePath: string, remoteFilePath: string, options?: ssh2.FastPutTransferOptions): Promise<string>;
        mkdir(remoteFilePath: string, recursive?: boolean): Promise<string>;
        rmdir(remoteFilePath: string, recursive?: boolean): Promise<string>;
        delete(remoteFilePath: string): Promise<string>;
        rename(remoteFilePath: string, newRemoteFilePath: string): Promise<string>;
        chmod(remoteFilePath: string, mode: number | string): Promise<string>;
        append(input: Buffer | NodeJS.ReadableStream, remoteFilePath: string, options?: ssh2.TransferOptions): Promise<string>;
        end(): Promise<void>;
        on(event: string, listener: (...args: any[]) => void): this;
    }
}
