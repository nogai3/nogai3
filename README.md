C/CPP:
#include <stdio.h>
int main() {
    for (int i = 0; i <= 10000; i++) {
        printf("%d. weird\n", i);
    }
}
Java:
public class Main {
    public static void main(String[] args) {
        for (int i = 0; i <= 10000, i++) {
            System.out.println(i + ". weird");
        }
    }
}
Python:
for i in range(0, 10001):
    print(f"{i}. weird")
C#:
using System;
public class HelloWorld
{
    public static void Main(string[] args)
    {
        for (int i = 0; i <= 10000; i++)
        {
            Console.WriteLine(i + ". weird");
        }
    }
}
JS:
for (let i = 0; i <= 10000; i++) {
    console.log(i + ". weird");
}
PHP:
<?php
for ($i = 0; $i <= 10000; $i++) {
    echo $i . ". weird\n";
}
?>
