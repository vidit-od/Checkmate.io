function NameCard({color} : {color : "white" | "black"}){
    return (
       <>
        <div className="flex p-2 h-[40px]">
            <div className={`bg-${color} h-full aspect-square rounded-sm`}>.</div>
            <div className="mx-2"> {color}</div>
        </div>
       </>
    )
}

export default NameCard
