import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export function MarkdownTable({ children }: Props) {
    return (
        <div className="my-5 max-w-full overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full border-collapse text-left text-sm">
                {children}
            </table>
        </div>
    );
}

export function MarkdownTableRow({ children }: Props) {
    return (
        <tr className="border-b border-slate-700/80 last:border-b-0">
            {children}
        </tr>
    );
}

export function MarkdownTableCell({ children }: Props) {
    return (
        <td className="px-4 py-3 align-top text-slate-300 [&>p]:mb-0">
            {children}
        </td>
    );
}

export function MarkdownTableHeader({ children }: Props) {
    return (
        <th
            scope="col"
            className="bg-slate-800/80 px-4 py-3 font-semibold text-slate-100"
        >
            {children}
        </th>
    );
}