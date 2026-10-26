import { TriangleAlert } from "lucide-react"

type PropTypes = {
    message: string;
}

export const WarningBar = ({ message }: PropTypes) => {
    return (
        <div
            role="alert"
            className="shrink-0 border-b border-yellow-900 bg-yellow-950 px-4 py-2 text-sm text-yellow-200 flex gap-2 items-center"
        >
            <TriangleAlert />
            <p>WARNING: {message}</p> 
        </div>
    )
}