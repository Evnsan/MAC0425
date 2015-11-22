#!/usr/bin/env python

import sys
import re
import numpy as np
from sklearn.cross_validation import StratifiedKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix
from sklearn.cross_validation import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.cross_validation import cross_val_score

class Parser(object):
    def __init__(self, fileName):
        self.fileName = fileName
        super(Parser, self).__init__()

    def divideSpamHan(self):
        try:
            with open(self.fileName, 'r') as inn:
                with open(self.fileName + '.data', 'w') as data:
                    with open(self.fileName + 'target', 'w') as target:
                        count = 0
                        cHam = 0
                        cSpam = 0
                        for line in inn:
                            count += 1
                            #if(count >= 100):
                                #return [count, cHam, cSpam]
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
                                data.write(line + '\n')
                                target.write('0\n')
                            elif key == 'spam':
                                cSpam += 1
                                data.write(line + '\n')
                                target.write('1\n')
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

    
def createSample(fileName):
    print "Pre-processando o arquivo de dados"
    print "Carregando arquivos"
    hiLimits = 350 
    lowLimits = 10 
    bag = {}
    print "Arquivo de entrada: " + str(sys.argv[1])
    p = Parser(sys.argv[1])
    total, cHam, cSpam = p.divideSpamHan()
    bag = p.generateBag(str(sys.argv[1]) + '.data', bag)
    count = p.countWords(str(sys.argv[1]) + '.data')
    bag = p.filtrateLowHiFrequence(bag, lowLimits, hiLimits)
    #print bag
    #para cada arquivo, gerar vetor:
    p.createVector(str(sys.argv[1]) + '.data', bag)
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


def loadSample(fileName):
    with open(fileName + '.data.vector', 'r') as data:
        x = np.loadtxt(data, dtype = int)
    with open(fileName + 'target', 'r') as target:
        y = np.loadtxt(target, dtype = int)
    print str(x.shape) + " "  + str(y.shape)
    return [x, y]

def validateKnn(x, y, neighbors, metric):
    knn = KNeighborsClassifier(n_neighbors = neighbors, metric = metric)
    Xtrain, Xtest, ytrain, ytest = train_test_split(x, y)
    knn.fit(Xtrain, ytrain)
    ypred = knn.predict(Xtest)
    print(confusion_matrix(ytest, ypred))
    print accuracy_score(ytest, ypred)
    cv = cross_val_score(
        KNeighborsClassifier(n_neighbors = neighbors, metric = metric),
        x, y, cv=5)
    print cv
    cv = cross_val_score(
        KNeighborsClassifier(n_neighbors = neighbors, metric = metric),
        x, y, cv=5)
    print cv
    print "STD: " + str(np.std(cv, ddof=1))
    print "MEAN: " + str(cv.mean())

    





def main():
    if(len(sys.argv) > 1):
        createSample(sys.argv[1])
        x, y = loadSample(sys.argv[1])
        print x
        print y
        #skl = StratifiedKFold(y, 5)
        #print skl
        #clf = KNeighborsClassifier(n_neighbors= 1, metric = 'manhattan')
        #knn1 = KNeighborsClassifier(n_neighbors=1)
        #clf.fit(x, y)
        #result = clf.predict_proba([x[4],])
        #print result
        #result = clf.predict([x[4],])
        #print result
        #print y[result]

        ###validation
        #y_pred = clf.predict(x)
        #print y_pred
        #print y
        # print(np.all(y == y_pred))
        #print(confusion_matrix(ytest, ypred))
        print "#####Euclidean######"
        validateKnn(x, y, 3, 'euclidean')
        validateKnn(x, y, 2, 'euclidean')
        validateKnn(x, y, 1, 'euclidean')
        print "####################"
        print "#####Manhattan######"
        validateKnn(x, y, 3, 'manhattan')
        validateKnn(x, y, 2, 'manhattan')
        validateKnn(x, y, 1, 'manhattan')
        print "####################"
        print "#####Hamming########"
        validateKnn(x, y, 3, 'hamming')
        validateKnn(x, y, 2, 'hamming')
        validateKnn(x, y, 1, 'hamming')
        print "####################"

    else:                                                                       
        print "Sem arquivo de entrada"
            
if __name__ == '__main__':
    main()


