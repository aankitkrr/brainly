interface InputProps{
    onChange? : () => void;
    placeholder : string;
    reference? : any;
    error? : any;
}

export const InputBox = ({onChange, placeholder, reference, error} : InputProps) => {
    return <div>
        <input type={"text"} ref = {reference} className=" px-3 py-3 border shadow border-gray-200 rounded mt-2 mb-2 w-full" onChange={onChange} placeholder={placeholder} />
        {error && <div className="text-red-500 text-sm"> {error}</div>}
    </div>
}