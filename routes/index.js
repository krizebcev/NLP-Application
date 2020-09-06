var express = require("express");
var router = express.Router();
var daleChallFormula = require("dale-chall-formula");
var automatedReadability = require("automated-readability");
var syllable = require("syllable");
var gunningFog = require("gunning-fog");
var dictionary = require("dictionary-en");
var nspell = require("nspell");
const {
  nepotrebneFraze,
  nepotpuneFraze,
  nejasneDvosmisleneFraze,
  frazeBezDodanogZnacenja,
  stopRijeci,
  zamjenskeFraze,
  poznateRijeci,
  jednostavnijeAlternativneRijeci,
} = require("./podaci");

router.get("/", function (req, res, next) {
  res.render("index", { inputText: "", rezultat: [], obavljenZahtjev: false });
});

router.get("/nepotrebneFraze", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = [];

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*;:{}=\-_`()\?]/g, "")
        )
        .filter((rijec) => rijec != "");

      rijeci.forEach((rijec) => {
        nepotrebneFraze.forEach((fraza) => {
          if (rijec.toLowerCase() === fraza) {
            rezultat.push(
              "Rečenica " +
                '"' +
                recenica +
                '"' +
                " sadrži nepotrebnu frazu " +
                '"' +
                fraza +
                '"'
            );
          }
        });
      });
    });

    rezultat = [...new Set(rezultat)];

    res.render("index", {
      inputText: req.query.inputTextarea,
      rezultat: rezultat,
      obavljenZahtjev: true,
    });
  } else {
    res.render("index", {
      inputText: "",
      rezultat: [],
      obavljenZahtjev: false,
    });
  }
});

router.get("/slabeUblazavajuceFormulacije", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = [];

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*;:{}=\-_`()\?]/g, "")
        )
        .filter((rijec) => rijec != "");

      rijeci.forEach((rijec) => {
        nepotpuneFraze.forEach((fraza) => {
          if (rijec.toLowerCase() === fraza) {
            rezultat.push(
              "Rečenica " +
                '"' +
                recenica +
                '"' +
                " sadrži nepotpunu frazu " +
                '"' +
                fraza +
                '"' +
                " koja može označavati nesigurnost pri izražaju"
            );
          }
        });
      });
    });

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*;:{}=\-_`()\?]/g, "")
        )
        .filter((rijec) => rijec != "");

      rijeci.forEach((rijec) => {
        nejasneDvosmisleneFraze.forEach((fraza) => {
          if (rijec.toLowerCase() === fraza) {
            rezultat.push(
              "Rečenica " +
                '"' +
                recenica +
                '"' +
                " sadrži nejasnu ili dvosmislenu frazu " +
                '"' +
                fraza +
                '"'
            );
          }
        });
      });
    });

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*;:{}=\-_`()\?]/g, "")
        )
        .filter((rijec) => rijec != "");

      rijeci.forEach((rijec) => {
        frazeBezDodanogZnacenja.forEach((fraza) => {
          if (rijec.toLowerCase() === fraza) {
            rezultat.push(
              "Rečenica " +
                '"' +
                recenica +
                '"' +
                " sadrži frazu " +
                '"' +
                fraza +
                '"' +
                " koja ne dodaje nikakvo značenje"
            );
          }
        });
      });
    });

    rezultat = [...new Set(rezultat)];

    res.render("slabeUblazavajuceFormulacije", {
      inputText: req.query.inputTextarea,
      rezultat: rezultat,
      obavljenZahtjev: true,
    });
  } else {
    res.render("slabeUblazavajuceFormulacije", {
      inputText: "",
      rezultat: [],
      obavljenZahtjev: false,
    });
  }
});

router.get("/kljucneRijeciFraze", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = [];

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*";:{}=\-_`()\?]/g, "")
        )
        .filter(
          (rijec) => rijec != "" && !stopRijeci.includes(rijec.toLowerCase())
        );

      rezultat.push(...rijeci);
    });

    let kljucneRijeci = {};
    rezultat.forEach((rijec) => {
      kljucneRijeci[rijec.toLowerCase()] =
        (kljucneRijeci[rijec.toLowerCase()] || 0) + 1;
    });

    let brojPojavljivanjaSort = Object.keys(kljucneRijeci).map(function (key) {
      return { rijec: key, value: this[key] };
    }, kljucneRijeci);
    brojPojavljivanjaSort.sort((p1, p2) => {
      return p2.value - p1.value;
    });

    kljucneRijeci = brojPojavljivanjaSort.slice(0, 10);

    let kljucneFraze = [];

    for (let i = 0; i < rezultat.length - 1; i++) {
      kljucneFraze.push(
        rezultat[i].toLowerCase() + " " + rezultat[++i].toLowerCase()
      );
      i--;
    }

    let kljucneFrazeObj = {};
    kljucneFraze.forEach((fraza) => {
      kljucneFrazeObj[fraza] = (kljucneFrazeObj[fraza] || 0) + 1;
    });

    let brojPojavljivanjaFrazeSort = Object.keys(kljucneFrazeObj).map(function (
      key
    ) {
      return { fraza: key, value: this[key] };
    },
    kljucneFrazeObj);

    kljucneFraze = brojPojavljivanjaFrazeSort
      .filter((fraza) => {
        return fraza.value > 1;
      })
      .sort((p1, p2) => {
        return p2.value - p1.value;
      });

    res.render("kljucneRijeci", {
      inputText: req.query.inputTextarea,
      kljucneRijeci: kljucneRijeci,
      kljucneFraze: kljucneFraze,
      obavljenZahtjev: true,
      brojacKljRijeci: 1,
      brojacKljFraze: 1,
    });
  } else {
    res.render("kljucneRijeci", {
      inputText: "",
      kljucneRijeci: [],
      kljucneFraze: [],
      obavljenZahtjev: false,
    });
  }
});

router.get("/pretjeranoUporabljeneFraze", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = [];
    let zamjenskeFrazeKeys = Object.keys(zamjenskeFraze);

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*";:{}=\-_`()\?]/g, "")
        )
        .filter(
          (rijec) => rijec != "" && !stopRijeci.includes(rijec.toLowerCase())
        );

      let rijeciObj = {};
      rijeci.forEach((rijec) => {
        rijeciObj[rijec.toLowerCase()] =
          (rijeciObj[rijec.toLowerCase()] || 0) + 1;
      });

      let brojPojavljivanjaSort = Object.keys(rijeciObj).map(function (key) {
        return { rijec: key, value: this[key] };
      }, rijeciObj);
      brojPojavljivanjaSort.sort((p1, p2) => {
        return p2.value - p1.value;
      });

      rijeci = brojPojavljivanjaSort
        .filter((fraza) => {
          return fraza.value > 2;
        })
        .sort((p1, p2) => {
          return p2.value - p1.value;
        });

      rijeci.forEach((rijecObj) => {
        for (let frazaKey of zamjenskeFrazeKeys) {
          if (rijecObj.rijec.toLowerCase() === frazaKey) {
            rezultat.push(
              "Kod rečenice " +
                '"' +
                recenica +
                '"' +
                " frazu " +
                '"' +
                frazaKey +
                '"' +
                " se preporučuje zamijeniti s " +
                zamjenskeFraze[frazaKey].map((f) => '"' + f + '"').join(", ")
            );
            break;
          }
        }
      });
    });

    res.render("pretjeranoUporabljeneFraze", {
      inputText: req.query.inputTextarea,
      rezultat: rezultat,
      obavljenZahtjev: true,
    });
  } else {
    res.render("pretjeranoUporabljeneFraze", {
      inputText: "",
      rezultat: [],
      obavljenZahtjev: false,
    });
  }
});

router.get("/provjeraCitljivosti", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = {};
    let daleChallObj = {};
    let automatedReadabilityObj = {};
    let gunningFogObj = {};
    let rijeciArr = [];
    let difficultWords = 0;
    let brojRijeci = 0;
    let brojSlovaBrojeva = 0;
    let complexPolysillabicWords = 0;

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() && rijec.replace(/[.,\/#!%&*";:{}=\-_`()\?]/g, "")
        )
        .filter((rijec) => rijec != "");

      brojRijeci += rijeci.length;
      brojSlovaBrojeva += rijeci.join("").length;

      rijeci = rijeci.filter(
        (rijec) => !stopRijeci.includes(rijec.toLowerCase())
      );

      rijeciArr.push(...rijeci);
    });

    rijeciArr.forEach((rijec) => {
      if (syllable(rijec) > 2) {
        complexPolysillabicWords++;
      }
    });

    rijeciArr = [...new Set(rijeciArr)];

    rijeciArr.forEach((rijec) => {
      let rijecPostojiNaListi = poznateRijeci.indexOf(rijec.toLowerCase()) > -1;
      if (!rijecPostojiNaListi) {
        difficultWords++;
      }
    });

    daleChallObj = {
      word: brojRijeci,
      sentence: recenice.length,
      difficultWord: difficultWords,
    };

    automatedReadabilityObj = {
      sentence: recenice.length,
      word: brojRijeci,
      character: brojSlovaBrojeva,
    };

    gunningFogObj = {
      sentence: recenice.length,
      word: brojRijeci,
      complexPolysillabicWord: complexPolysillabicWords,
    };

    let brojGodinaDaleChall = 0;
    let daleChallRezultat = daleChallFormula(daleChallObj);

    if (daleChallRezultat <= 4.9) {
      brojGodinaDaleChall = 9.5;
    } else if (daleChallRezultat >= 5.0 && daleChallRezultat <= 5.9) {
      brojGodinaDaleChall = 11.5;
    } else if (daleChallRezultat >= 6.0 && daleChallRezultat <= 6.9) {
      brojGodinaDaleChall = 13.5;
    } else if (daleChallRezultat >= 7.0 && daleChallRezultat <= 7.9) {
      brojGodinaDaleChall = 15.5;
    } else if (daleChallRezultat >= 8.0 && daleChallRezultat <= 8.9) {
      brojGodinaDaleChall = 17.5;
    } else if (daleChallRezultat >= 9.0 && daleChallRezultat <= 9.9) {
      brojGodinaDaleChall = 19.5;
    } else if (daleChallRezultat >= 9.9) {
      brojGodinaDaleChall = 21.5;
    }

    let brojGodinaAutomatedReadability = 0;
    let automatedReadabilityRezultat = automatedReadability(
      automatedReadabilityObj
    );

    if (Math.round(automatedReadabilityRezultat) == 1) {
      brojGodinaAutomatedReadability = 5.5;
    } else if (Math.round(automatedReadabilityRezultat) == 2) {
      brojGodinaAutomatedReadability = 6.5;
    } else if (Math.round(automatedReadabilityRezultat) == 3) {
      brojGodinaAutomatedReadability = 8.5;
    } else if (Math.round(automatedReadabilityRezultat) == 4) {
      brojGodinaAutomatedReadability = 9.5;
    } else if (Math.round(automatedReadabilityRezultat) == 5) {
      brojGodinaAutomatedReadability = 10.5;
    } else if (Math.round(automatedReadabilityRezultat) == 6) {
      brojGodinaAutomatedReadability = 11.5;
    } else if (Math.round(automatedReadabilityRezultat) == 7) {
      brojGodinaAutomatedReadability = 12.5;
    } else if (Math.round(automatedReadabilityRezultat) == 8) {
      brojGodinaAutomatedReadability = 13.5;
    } else if (Math.round(automatedReadabilityRezultat) == 9) {
      brojGodinaAutomatedReadability = 14.5;
    } else if (Math.round(automatedReadabilityRezultat) == 10) {
      brojGodinaAutomatedReadability = 15.5;
    } else if (Math.round(automatedReadabilityRezultat) == 11) {
      brojGodinaAutomatedReadability = 16.5;
    } else if (Math.round(automatedReadabilityRezultat) == 12) {
      brojGodinaAutomatedReadability = 17.5;
    } else if (Math.round(automatedReadabilityRezultat) == 13) {
      brojGodinaAutomatedReadability = 23.5;
    } else if (Math.round(automatedReadabilityRezultat) >= 14) {
      brojGodinaAutomatedReadability = 24.5;
    }

    let brojGodinaGunningFog = 0;
    let gunningFogRezultat = gunningFog(gunningFogObj);

    if (Math.round(gunningFogRezultat) == 6) {
      brojGodinaGunningFog = 11.5;
    } else if (Math.round(gunningFogRezultat) == 7) {
      brojGodinaGunningFog = 12.5;
    } else if (Math.round(gunningFogRezultat) == 8) {
      brojGodinaGunningFog = 13.5;
    } else if (Math.round(gunningFogRezultat) == 9) {
      brojGodinaGunningFog = 14.5;
    } else if (Math.round(gunningFogRezultat) == 10) {
      brojGodinaGunningFog = 15.5;
    } else if (Math.round(gunningFogRezultat) == 11) {
      brojGodinaGunningFog = 16.5;
    } else if (Math.round(gunningFogRezultat) == 12) {
      brojGodinaGunningFog = 17.5;
    } else if (Math.round(gunningFogRezultat) == 13) {
      brojGodinaGunningFog = 18.5;
    } else if (Math.round(gunningFogRezultat) == 14) {
      brojGodinaGunningFog = 19.5;
    } else if (Math.round(gunningFogRezultat) == 15) {
      brojGodinaGunningFog = 20.5;
    } else if (Math.round(gunningFogRezultat) == 16) {
      brojGodinaGunningFog = 21.5;
    } else if (Math.round(gunningFogRezultat) >= 17) {
      brojGodinaGunningFog = 22.5;
    }

    let prosjecniRezultat = Math.round(
      (daleChallRezultat + automatedReadabilityRezultat + gunningFogRezultat) /
        3
    );

    let projescniBrojGodina = Math.round(
      (brojGodinaDaleChall +
        brojGodinaAutomatedReadability +
        brojGodinaGunningFog) /
        3
    );

    rezultat = {
      rezultatTekst:
        "Prosječna ocjena čitljivosti zadanog teksta je oko " +
        prosjecniRezultat +
        ". Dakle, zadani tekst bi trebao biti lako razumljiv osobama kojima je broj godina od " +
        (projescniBrojGodina - 1) +
        " do " +
        projescniBrojGodina +
        ".",
      brojRecenica: recenice.length,
      brojRijeci: brojRijeci,
      brojSlovaBrojeva: brojSlovaBrojeva,
      brojKompleksnihVisesloznihRijeci: complexPolysillabicWords,
    };

    res.render("provjeraCitljivosti", {
      inputText: req.query.inputTextarea,
      rezultat: rezultat,
      obavljenZahtjev: true,
    });
  } else {
    res.render("provjeraCitljivosti", {
      inputText: "",
      rezultat: {},
      obavljenZahtjev: false,
    });
  }
});

router.get("/jednostavnijeAlternativneRijeci", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = [];
    let jednostavnijeAlternativneRijeciKeys = Object.keys(
      jednostavnijeAlternativneRijeci
    );

    let slozenaRijec = false;
    let rijecPostojiURecenici = false;

    recenice.forEach((recenica) => {
      let rijeci = recenica
        .split(" ")
        .map(
          (rijec) =>
            rijec.trim() &&
            rijec.replace(/[.,\/#!%&*";:{}=\-_`()\?]/g, "") &&
            rijec.toLowerCase()
        )
        .filter((rijec) => rijec != "");

      for (let jednostavnijaAlternativnaRijec of jednostavnijeAlternativneRijeciKeys) {
        if (jednostavnijaAlternativnaRijec.split(" ").length > 1) {
          slozenaRijec = true;
          rijecPostojiURecenici = true;
        } else {
          slozenaRijec = false;
          rijecPostojiURecenici = rijeci.includes(
            jednostavnijaAlternativnaRijec
          );
        }

        if (
          recenica.toLowerCase().includes(jednostavnijaAlternativnaRijec) &&
          jednostavnijeAlternativneRijeci[jednostavnijaAlternativnaRijec]
            .replace.length > 0 &&
          rijecPostojiURecenici &&
          !jednostavnijeAlternativneRijeci[
            jednostavnijaAlternativnaRijec
          ].hasOwnProperty("omit")
        ) {
          rezultat.push(
            "Kod rečenice " +
              '"' +
              recenica +
              '"' +
              " frazu " +
              '"' +
              jednostavnijaAlternativnaRijec +
              '"' +
              " se preporučuje zamijeniti s " +
              jednostavnijeAlternativneRijeci[
                jednostavnijaAlternativnaRijec
              ].replace
                .map((f) => '"' + f + '"')
                .join(", ")
          );
        } else if (
          recenica.toLowerCase().includes(jednostavnijaAlternativnaRijec) &&
          jednostavnijeAlternativneRijeci[jednostavnijaAlternativnaRijec]
            .replace.length > 0 &&
          rijecPostojiURecenici &&
          jednostavnijeAlternativneRijeci[jednostavnijaAlternativnaRijec]
            .omit === true
        ) {
          rezultat.push(
            "Kod rečenice " +
              '"' +
              recenica +
              '"' +
              " frazu " +
              '"' +
              jednostavnijaAlternativnaRijec +
              '"' +
              " se preporučuje zamijeniti s " +
              jednostavnijeAlternativneRijeci[
                jednostavnijaAlternativnaRijec
              ].replace
                .map((f) => '"' + f + '"')
                .join(", ") +
              " ili ukloniti iz rečenice"
          );
        } else if (
          recenica.toLowerCase().includes(jednostavnijaAlternativnaRijec) &&
          jednostavnijeAlternativneRijeci[jednostavnijaAlternativnaRijec]
            .replace.length === 0 &&
          rijecPostojiURecenici &&
          jednostavnijeAlternativneRijeci[jednostavnijaAlternativnaRijec]
            .omit === true
        ) {
          rezultat.push(
            "Kod rečenice " +
              '"' +
              recenica +
              '"' +
              " frazu " +
              '"' +
              jednostavnijaAlternativnaRijec +
              '"' +
              " se preporučuje ukloniti iz rečenice"
          );
        }
      }
    });

    res.render("jednostavnijeAlternativneRijeci", {
      inputText: req.query.inputTextarea,
      rezultat: rezultat,
      obavljenZahtjev: true,
    });
  } else {
    res.render("jednostavnijeAlternativneRijeci", {
      inputText: "",
      rezultat: [],
      obavljenZahtjev: false,
    });
  }
});

router.get("/pronalazakGramatickihGresaka", function (req, res, next) {
  if (
    req.query.inputTextarea != undefined &&
    req.query.inputTextarea.trim().length > 0
  ) {
    let recenice = req.query.inputTextarea
      .split(".")
      .map((recenica) => recenica.trim())
      .filter((recenica) => recenica != "");

    let rezultat = [];

    dictionary(pronadiGramatickeGreske);

    function pronadiGramatickeGreske(err, dict) {
      if (err) {
        throw err;
      }

      let spell = nspell(dict);

      recenice.forEach((recenica) => {
        let recenicaRezultat = recenica;

        recenica = recenica.replace(/[.,\/#!%&*";:{}=\-_`()\?]/g, "");

        let rijeci = recenica
          .split(" ")
          .map((rijec) => rijec.trim() && rijec.toLowerCase())
          .filter((rijec) => rijec != "");

        rijeci.forEach((rijec) => {
          if (!spell.correct(rijec)) {
            if (spell.suggest(rijec).length > 0) {
              rezultat.push(
                "Kod rečenice " +
                  '"' +
                  recenicaRezultat +
                  '"' +
                  " riječ " +
                  '"' +
                  rijec +
                  '"' +
                  " je pogrešno napisana. Možda ste mislili napisati " +
                  spell
                    .suggest(rijec)
                    .map((f) => '"' + f.toLowerCase() + '"')
                    .join(", ")
              );
            } else {
              rezultat.push(
                "Kod rečenice " +
                  '"' +
                  recenica +
                  '"' +
                  " riječ " +
                  '"' +
                  rijec +
                  '"' +
                  " je pogrešno napisana. Nema prijedloga"
              );
            }
          }
        });
      });

      res.render("gramatickePogreske", {
        inputText: req.query.inputTextarea,
        rezultat: rezultat,
        obavljenZahtjev: true,
      });
    }
  } else {
    res.render("gramatickePogreske", {
      inputText: "",
      rezultat: [],
      obavljenZahtjev: false,
    });
  }
});

module.exports = router;
