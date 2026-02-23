import BlocklyLab from "@/features/labs/components/BlocklyLab";

export default function PythonLab() {
    return (
        <div className="h-screen w-full bg-[#020617]">
            <BlocklyLab
                title="Intuit Code Lab: Python para Bachillerato"
                objective="Crea un programa que mueva al robot hacia la meta para recolectar los datos."
                toolboxType="python"
                gridSize={5}
                initialPos={{ x: 0, y: 4 }}
                goalPos={{ x: 4, y: 0 }}
                onComplete={() => console.log("Python Challenge Completed!")}
            />
        </div>
    );
}
