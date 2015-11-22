#!/usr/bin/env python

import sys
import re

class Parser(object):
    def __init__(self, fileName):
        self.fileName = fileName
        super(Parser, self).__init__()

    def divideSpamHan(self):
        try:
            with open(self.fileName, 'r') as inn:
                with open("spam.out", 'w') as spamFile:
                    with open("ham.out", 'w') as hamFile :
                        count = 0
                        cHam = 0
                        cSpam = 0
                        for line in inn:
                            count += 1
                            line = line.split("\n")[0]
                            vect = line.split(",")
                            key = vect[0]
                            del vect[0]
                            line = ""
                            for word in vect:
                                line += word
                            line = self.filtrateQuot(line)
                            line = self.filtratePeriod(line)
                            if key == 'ham':
                                cHam += 1
                                hamFile.write(line + '\n')
                            elif key == 'spam':
                                cSpam += 1
                                spamFile.write(line + '\n')
                            else:
                                print ("Nao definido" + 
                                       " - Nem SPAM nem HAM na linha " +
                                str(count) + ":")
                        print "Total de linhas processadas " + str(count)
                        print "Total Hams processados " + str(cHam)
                        print "Total Spams processados " + str(cSpam)
                        return [count, cHam, cSpam]
        except IOError as e:
            print 'Operation failed: %s' % e.strerror

    def filtrateQuot(self, line):
        out = ""
        tmp = line.split("\"")
        for stretch in tmp:
            if stretch != '':
                out += stretch
        return out

    def filtratePeriod(self, line):
        out = ""
        tmp = re.sub(r'(\.{2,})', '',line)
        #print "Entrou linha = " + line
        for stretch in tmp:
            if stretch != '':
                out += stretch
        #print "Nivel 1 = " + str(out)
        out = self.filtratePeriod2(out)
        return out
    
    def filtratePeriod2(self, line):
        out = ""
        tmp = re.sub(r'(\. )', '',line)
        for stretch in tmp:
            if stretch != '':
                out += stretch
        #print "Nivel 2 = " + str(out)
        out = self.filtratePeriod3(out)
        return out
    
    def filtratePeriod3(self, line):
        out = line
        if out.endswith("."):
            out = out[:-1]
        #print "Nivel 3 = " + str(out)
        return out

    def generateBag(self, fileName, bag):
        try:
            with open(fileName, 'r') as fp:
                for line in fp:
                    line = line.split("\n")[0]
                    line = line.split(" ")
                    for word in line:
                        if word in bag:
                            bag[word] += 1
                        else:
                            bag[word] = 1
        except IOError as e:
            print 'Operation failed: %s' % e.strerror
        return bag

    def  filtrateLowHiFrequence(self, bag, lowLimit, hiLimit):
        toDelete = []
        for word in bag:
            if bag[word] <= lowLimit or bag[word] >= hiLimit:
                toDelete.append(word)
        for word in toDelete:
            del bag[word]
        return bag

    def countWords(self, fileName):
        count = 0
        try:
            with open(fileName, 'r') as fp:
                for line in fp:
                    line = line.split("\n")[0]
                    line = line.split(" ")
                    for word in line:
                        count += 1
        except IOError as e:
            print 'Operation failed: %s' % e.strerror
        return count

    def writeBag(self, fileName, bag):
        try:
            with open(fileName, 'w') as fp:
                with open(fileName + '.label', 'w') as lbl:
                    string = ''
                    for word in bag:
                        fp.write(word + "\n")
                        string += word + '\t'
                    string = string[:-1]
                    lbl.write(string)

        except IOError as e:
            print 'Operation failed: %s' % e.strerror
    
    def createVector(self, fileName, bag):
        try:
            vect = {}
            for word in bag:
                vect[word] = 0
            with open(fileName, 'r') as inn:
                with open(fileName + ".vector", 'w') as out:
                    for line in inn:
                        for word in vect:
                            vect[word] = 0
                        line = line.split('\n')[0]
                        line = line.split(' ')
                        for word in line:
                            if word in vect:
                                vect[word] += 1
                        string = ""
                        for word in vect:
                            string += str(vect[word]) + '\t'
                        string = string[:-1]
                        out.write(string + '\n')
        except IOError as e:
            print 'Operation failed: %s' % e.strerror

    
def main():
    print "Pre-processando o arquivo de dados"
    print "Carregando arquivos"
    if(len(sys.argv) > 1):
        hiLimits = 400
        lowLimits = 10 
        bag = {}
        print "Arquivo de entrada: " + str(sys.argv[1])
        p = Parser(sys.argv[1])
        total, cHam, cSpam = p.divideSpamHan()
        bag = p.generateBag("spam.out", bag)
        count = p.countWords("spam.out")
        #print bag
        bag = p.generateBag("ham.out", bag)
        count += p.countWords("ham.out")
        #print bag
        bag = p.filtrateLowHiFrequence(bag, lowLimits, hiLimits)
        #print bag
        #para cada arquivo, gerar vetor:
        p.createVector("spam.out", bag)
        p.createVector("ham.out", bag)
        #separar em arquivos treinamento e validacao
        #p.separeVT("spam.out.vector", cSpam)
        #p.separeVT("ham.out.vector", cHam)
        print "Total de linhas processadas " + str(total)
        print "Total Hams processados " + str(cHam)
        print "Total Spams processados " + str(cSpam)
        print "Total de linhas nao classificadas " + str(total - cHam - cSpam)
        print "Total de palavras lidas " + str(count)
        print "Usando Limites de " + str(lowLimits) + " e " + str(hiLimits)
        print "Tamanho da bag " + str(len(bag))
        p.writeBag("bag.out", bag)
        print bag

    else:                                                                       
        print "Sem arquivo de entrada"

            
if __name__ == '__main__':
    main()


