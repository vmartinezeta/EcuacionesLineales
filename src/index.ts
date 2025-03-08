enum Signo {
    MAS = 1,
    MENOS = -1
}

type TSigno = Signo.MENOS | Signo.MAS

type TLetra = "a" | "b" | "c" | "m" | "n" | "o" | "p" | "q" | "x" | "y" | "z"

type TLiteral = TLetra | TLetra[]

type TTerminoAlgebraico = {
    signo: TSigno
    coeficiente: number
    literal: TLiteral
}

type TConstante = Omit<TTerminoAlgebraico, "literal">

type TTermino = TTerminoAlgebraico | TConstante

type TReducible<T extends TTermino> = T & {
    mas: (otro: T) => T
}

type TTerminoReducible = TTermino | TReducible<TConstante> | TReducible<TTerminoAlgebraico>

type TTerminoReducibleOrNull = TTerminoReducible | null

type TMiembroEcuacion = {
    terminos: TTerminoReducible[]
}

class Constante implements TReducible<TConstante> {
    public signo: TSigno
    public coeficiente: number

    constructor(signo: TSigno, coeficiente: number) {
        this.signo = signo
        this.coeficiente = coeficiente
    }

    mas(otro: TConstante): TConstante {
        const { signo: s1, coeficiente: c1 } = this
        const { signo: s2, coeficiente: c2 } = otro
        const total = s1 * c1 + s2 * c2
        return new Constante(this.getSigno(total), total)
    }

    getSigno(numero: number): TSigno {
        return numero > 0 ? 1 : -1
    }
}

class Termino extends Constante implements TReducible<TTerminoAlgebraico> {
    public literal: TLiteral

    constructor(signo: TSigno, coeficiente: number, literal: TLiteral) {
        super(signo, coeficiente)
        this.literal = literal
    }

    mas(otro: TTerminoAlgebraico): TTerminoAlgebraico {
        const { signo: s1, coeficiente: c1 } = this
        const { signo: s2, coeficiente: c2 } = otro
        const total = s1 * c1 + s2 * c2
        return new Termino(this.getSigno(total), total, this.literal)
    }
}

class MiembroEcuacion implements TMiembroEcuacion {
    public terminos: TTerminoReducible[]

    constructor(terminos: TTerminoReducible[]) {
        this.terminos = terminos
    }

}

class Calculadora {
    public miembroIzq: TMiembroEcuacion
    public miembroDer: TMiembroEcuacion

    constructor(miembroIzq: TMiembroEcuacion, miembroDer: TMiembroEcuacion) {
        this.miembroIzq = miembroIzq
        this.miembroDer = miembroDer
    }

    resolver() {
        let reducir = true
        while (this.miembroIzq.terminos.length > 1 ) {
            if (reducir) {
                if (this.miembroIzq.terminos.every(t => t instanceof Termino)) {
                    this.reducirSemejantes()
                }

                if (this.miembroDer.terminos.length>1 && !this.miembroDer.terminos.some(t => t instanceof Termino)) {
                    this.reducir()
                }
                reducir = !reducir
            } else {
                const idx = this.miembroIzq.terminos.findIndex(element => !(element instanceof Termino))
                if (idx>=0) {
                    const [origen] = this.miembroIzq.terminos.splice(idx, 1)
                    this.transponer(origen, this.miembroDer)
                }
                reducir = !reducir
            }
        }

        const [{ coeficiente: c1 }] = this.miembroIzq.terminos
        const [{ coeficiente: c2 }] = this.miembroDer.terminos
        console.log("x = ", c2 / c1)
    }

    reducirSemejantes() {
        const termino = this.miembroIzq.terminos.reduce((total: TTerminoReducibleOrNull, termino: TTerminoReducible) => {
            if (!total) return termino
            return (total as TReducible<TTerminoAlgebraico>).mas(termino as TTerminoAlgebraico)
        }, null) as TTerminoReducible
        this.miembroIzq.terminos = []
        this.miembroIzq.terminos.push(termino)
    }

    reducir() {
        const valor = this.miembroDer.terminos.reduce((total: TTerminoReducibleOrNull, termino: TTerminoReducible) => {
            if (!total) return termino
            return (total as TReducible<TConstante>).mas(termino as TConstante)
        }, null) as TTerminoReducible
        this.miembroDer.terminos = []
        this.miembroDer.terminos.push(valor)
    }

    transponer(origen: TTerminoReducible, miembro:MiembroEcuacion) {
        origen.signo = Signo.MENOS*origen.signo
        miembro.terminos.push(origen)
    }
}

const calculadora = new Calculadora(
    new MiembroEcuacion([
        new Termino(Signo.MAS, 10, "x"),
        new Constante(Signo.MAS, 10),
        new Termino(Signo.MENOS, 5, "x"),
    ]),
    new MiembroEcuacion([
        new Constante(Signo.MAS, 60)
    ])
)

calculadora.resolver()