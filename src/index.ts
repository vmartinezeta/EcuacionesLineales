type TSigno = -1 | 1
type TLetra = "a" | "b" | "c" | "m" | "n" | "o" | "p" | "q" | "x" | "y" | "z"

type TLiteral = TLetra | TLetra[]

type TTerminoAlgebraico = {
    signo: TSigno
    coeficiente: number
    literal: TLiteral
}

type TConstante = Omit<TTerminoAlgebraico, "literal" >
type TTermino = TTerminoAlgebraico | TConstante 

type TReducible<T extends TTermino> = T & {
    mas : (otro: T) => T
}

type TTerminoReducible = TTermino | TReducible<TConstante> | TReducible<TTerminoAlgebraico>
type TTerminoReducibleOrNull = TTerminoReducible | null


enum Signo {
    MAS = 1,
    MENOS = -1
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


class Calculadora{
    public expresion: TTerminoReducible[]

    constructor(expresion:TTerminoReducible[]) {
        this.expresion = expresion
    }

    reducirSemejantes() {
        return this.expresion.reduce((total: TTerminoReducibleOrNull, termino: TTerminoReducible) => {
            if (!total) return termino
            return (total as TReducible<TTerminoAlgebraico>).mas(termino as TTerminoAlgebraico)
        }, null) as TTerminoAlgebraico
    }

    reducir() {
        return this.expresion.reduce((total: TTerminoReducibleOrNull, termino: TTerminoReducible) => {
            if (!total) return termino
            return (total as TReducible<TConstante>).mas(termino as TConstante)
        }, null) as TConstante
    }
            
    transponer() {}
}


const calculadora = new Calculadora([
    new Termino(Signo.MAS, 20, ["x", "y", "z"]),
    new Termino(Signo.MAS, 30, ["x", "y", "z"])
])

const termino = calculadora.reducirSemejantes()

console.log(`${termino.coeficiente}${Array.isArray(termino.literal)?termino.literal.join(""):termino.literal}`)